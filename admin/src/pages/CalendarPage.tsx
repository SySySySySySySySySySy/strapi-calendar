import type { EventSourceFunc } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Layouts, Page } from "@strapi/admin/strapi-admin";
import {
	Box,
	EmptyStateLayout,
	LinkButton,
	Loader,
	Field,
	SingleSelect,
	SingleSelectOption,
} from "@strapi/design-system";
import { Cog, Plus } from "@strapi/icons";
import { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import tinyColor from "tinycolor2";
import Illo from "../components/Calendar/Illo";
import { useSettings } from "../context/Settings";
import { PLUGIN_ID } from "../pluginId";
import { getTranslation } from "../utils/getTranslation";

// Utility function to get JWT token from cookies
const getJwtToken = (): string | null => {
	const cookies = document.cookie.split(";");
	for (const cookie of cookies) {
		const trimmedCookie = cookie.trim();
		const equalIndex = trimmedCookie.indexOf("=");
		if (equalIndex === -1) continue;

		const name = trimmedCookie.substring(0, equalIndex);
		const value = trimmedCookie.substring(equalIndex + 1);

		if (name === "jwtToken") {
			return decodeURIComponent(value);
		}
	}
	return null;
};

const CalendarPage = () => {
	const { settings, loading } = useSettings();
	const { formatMessage } = useIntl();
	const theme = useTheme();
	const [selectedFilter, setSelectedFilter] = useState<string>("");
	const [filterOptions, setFilterOptions] = useState<
		Array<{ id: string; label: string }>
	>([]);
	const [calendarKey, setCalendarKey] = useState(0);

	// Fetch filter options when settings change
	useEffect(() => {
		if (settings.filterEnabled && settings.filterField && settings.collection) {
			const fetchFilterOptions = async () => {
				const jwtToken = getJwtToken();
				const headers: Record<string, string> = {};

				if (jwtToken) {
					headers["Authorization"] = `Bearer ${jwtToken}`;
				}

				try {
					// Get the collection attributes to find the target collection for the relation
					const collection = settings.collection;
					const filterField = settings.filterField;

					// Fetch the schema to understand the relation
					const schemaResponse = await fetch(
						`/content-manager/content-types/${collection}`,
						{
							headers,
						},
					);
					const schemaData = await schemaResponse.json();

					const relationAttribute =
						schemaData?.data?.schema?.attributes?.[filterField];
					const targetCollection = relationAttribute?.target;

					if (targetCollection) {
						// Fetch all documents from the target collection
						const response = await fetch(
							`/content-manager/collection-types/${targetCollection}?pageSize=100`,
							{ headers },
						);
						const data = await response.json();

						// Map to filter options
						const options = (data?.results || []).map((item: any) => ({
							id: item.documentId,
							label:
								item.name ||
								item.title ||
								item.label ||
								item.displayName ||
								item.documentId ||
								"Unknown",
						}));

						setFilterOptions(options);
					}
				} catch (error) {
					console.error("Error fetching filter options:", error);
				}
			};

			fetchFilterOptions();
		} else {
			setFilterOptions([]);
			setSelectedFilter("");
		}
	}, [settings.filterEnabled, settings.filterField, settings.collection]);

	// Create event source function with JWT token in headers
	const eventSource: EventSourceFunc = useMemo(
		() => (fetchInfo, successCallback, failureCallback) => {
			const jwtToken = getJwtToken();
			const headers: Record<string, string> = {};

			if (jwtToken) {
				headers["Authorization"] = `Bearer ${jwtToken}`;
			}

			const url = new URL(`/${PLUGIN_ID}/`, window.location.origin);
			url.searchParams.append("start", fetchInfo.startStr);
			url.searchParams.append("end", fetchInfo.endStr);

			// Add filter parameter if enabled and selected
			if (settings.filterEnabled && selectedFilter) {
				url.searchParams.append("filter", selectedFilter);
			}

			fetch(url.toString(), { headers })
				.then((response) => {
					if (!response.ok) {
						throw new Error(
							`Failed to fetch calendar events: ${response.status} ${response.statusText}`,
						);
					}
					return response.json();
				})
				.then((data) => successCallback(data))
				.catch((error) => {
					console.error("Error fetching calendar events:", error);
					failureCallback(error);
				});
		},
		[selectedFilter, settings.filterEnabled],
	);

	if (loading) return <Loader />;
	if (!settings.collection) {
		return (
			<>
				<Layouts.Header
					title={formatMessage({
						id: getTranslation("plugin.name"),
						defaultMessage: "Calendar",
					})}
					subtitle={formatMessage({
						id: getTranslation("plugin.tagline"),
						defaultMessage: "Visualize your events",
					})}
					as="h2"
				/>
				<Layouts.Content>
					<EmptyStateLayout
						icon={<Illo />}
						content={formatMessage({
							id: getTranslation(
								"view.calendar.state.empty.configure-settings.message",
							),
							defaultMessage:
								"Please configure the settings before accessing the calendar",
						})}
						action={
							<LinkButton
								variant="primary"
								href={`/admin/settings/${PLUGIN_ID}`}
								startIcon={<Cog color={"white"} />}
							>
								{formatMessage({
									id: getTranslation(
										"view.calendar.state.empty.configure-settings.action",
									),
									defaultMessage: "Settings",
								})}
							</LinkButton>
						}
					/>
				</Layouts.Content>
			</>
		);
	}

	const {
		monthView,
		weekView,
		workWeekView,
		dayView,
		defaultView,
		todayButton,
	} = settings;

	// Define the views to be displayed
	let views = "";
	if (monthView) views += "dayGridMonth,";
	if (weekView) views += "timeGridWeek,";
	if (workWeekView) views += "workWeek,";
	if (dayView) views += "dayView,";
	views = views.slice(0, -1);

	// Define the buttons to be displayed
	const left = "prev,next" + (todayButton ? " today" : "");

	// Define initial view
	const initialView =
		defaultView === "Month"
			? "dayGridMonth"
			: defaultView === "Week"
				? "timeGridWeek"
				: defaultView === "Work-Week"
					? "workWeek"
					: defaultView === "Day"
						? "dayView"
						: "dayGridMonth";

	const primaryAction = settings.createButton ? (
		<LinkButton
			startIcon={<Plus color={"white"} />}
			href={`/admin/content-manager/collection-types/${settings.collection}/create`}
		>
			{formatMessage(
				{
					id: getTranslation("view.calendar.action.create-entry"),
					defaultMessage: "Create New",
				},
				{ collection: settings.collection?.split(".")[1] },
			)}
		</LinkButton>
	) : (
		<div />
	);

	// Override Styles
	const primaryColor = settings.primaryColor;
	const lightPrimaryColor = tinyColor(primaryColor).lighten().toString();

	const sty = `
    :root {
      --fc-page-bg-color: transparent;
      --fc-button-bg-color: ${primaryColor};
      --fc-button-active-bg-color: ${lightPrimaryColor};
      --fc-button-hover-bg-color: ${lightPrimaryColor};
      --fc-button-border-color: rgba(0, 0, 0, 0.2);
      --fc-button-active-border-color: rgba(0, 0, 0, 0.2);
    }

    .fc {
      font-size: 1.3em;
    }

    .fc-button, .fc-toolbar-title, .fc-col-header-cell-cushion {
      text-transform: capitalize !important;
    }

    .fc-toolbar-title {
      font-weight: bold !important;
    }

    .fc-button {
      padding: 0.6em 1.2em !important;
    }

    .fc-day-today {
      background-color: ${settings.primaryColor}22 !important;
    }

    .fc-timegrid-slots tr {
      height: 3.5em;
    }

    .fc-daygrid-day-frame {
      min-height: 10em !important;
    }

    .fc-daygrid-day-events a,
    .fc-daygrid-day-events a:hover,
    .fc-daygrid-day-events a:visited,
    .fc-daygrid-day-events a:active {
      color: ${theme.colors.neutral1000};
    }
  `;

	if (loading) {
		return <Page.Loading />;
	}

	return (
		<>
			<Layouts.Header
				title={formatMessage({
					id: getTranslation("plugin.name"),
					defaultMessage: "Calendar",
				})}
				subtitle={formatMessage({
					id: getTranslation("plugin.tagline"),
					defaultMessage: "Visualize your events",
				})}
				as="h2"
				primaryAction={primaryAction}
			/>
			<Layouts.Content>
				{settings.filterEnabled &&
					settings.filterField &&
					filterOptions.length > 0 && (
						<Box paddingBottom={4} style={{ maxWidth: "300px" }}>
							<Field.Root>
								<Field.Label>
									{formatMessage({
										id: getTranslation("view.calendar.filter.label"),
										defaultMessage: "Filter by",
									})}{" "}
									{settings.filterField}
								</Field.Label>
								<SingleSelect
									onChange={(value: string) => {
										setSelectedFilter(value);
										setCalendarKey((prev) => prev + 1);
									}}
									value={selectedFilter}
									placeholder={formatMessage({
										id: getTranslation("view.calendar.filter.placeholder"),
										defaultMessage: "All",
									})}
								>
									<SingleSelectOption value="">
										{formatMessage({
											id: getTranslation("view.calendar.filter.all"),
											defaultMessage: "All",
										})}
									</SingleSelectOption>
									{filterOptions.map((option) => (
										<SingleSelectOption key={option.id} value={option.id}>
											{option.label}
										</SingleSelectOption>
									))}
								</SingleSelect>
							</Field.Root>
						</Box>
					)}
				<Box
					background={"neutral0"}
					shadow="filterShadow"
					padding={[5, 8]}
					hasRadius
					style={{
						zIndex: 0,
						position: "relative",
					}}
				>
					<style>{sty}</style>
					<FullCalendar
						key={calendarKey}
						events={eventSource}
						plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
						initialView={initialView}
						slotMinTime={settings.startHour}
						slotMaxTime={settings.endHour}
						allDaySlot={false}
						views={{
							workWeek: {
								type: "timeGrid",
								duration: { week: 1 },
								hiddenDays: [0, 6, 7],
								buttonText: formatMessage({
									id: getTranslation("view.calendar.view.work-week"),
									defaultMessage: "Work Week",
								}),
							},
							dayView: {
								type: "timeGrid",
								duration: { days: 1 },
								buttonText: formatMessage({
									id: getTranslation("view.calendar.view.day"),
									defaultMessage: "Day View",
								}),
							},
						}}
						height={"auto"}
						locale={formatMessage({
							id: getTranslation("view.calendar.locale"),
							defaultMessage: "en-US",
						})}
						headerToolbar={{
							left,
							center: "title",
							right: views,
						}}
					/>
				</Box>
			</Layouts.Content>
		</>
	);
};

export default CalendarPage;
