import type { EventSourceFunc } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Layouts, Page } from "@strapi/admin/strapi-admin";
import {
	Box,
	EmptyStateLayout,
	Field,
	LinkButton,
	Loader,
	SingleSelect,
	SingleSelectOption,
	Button,
} from "@strapi/design-system";
import { Cog, Plus } from "@strapi/icons";
import { useEffect, useMemo, useState, useRef } from "react";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import tinyColor from "tinycolor2";
import Illo from "../components/Calendar/Illo";
import EventModal, { type EventFormData } from "../components/Calendar/EventModal";
import EventPreviewModal from "../components/Calendar/EventPreviewModal";
import { useSettings } from "../context/Settings";
import { PLUGIN_ID } from "../pluginId";
import { getTranslation } from "../utils/getTranslation";
import api from "../api";

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
	const calendarRef = useRef<any>(null);

	// Modal states
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<any>(null);
	const [editEventData, setEditEventData] = useState<EventFormData | null>(null);

	// Fetch filter options when settings change
	useEffect(() => {
		if (!!settings.filterEnabled && !!settings.filterField) {
			const fetchFilterOptions = async () => {
				const jwtToken = getJwtToken();
				const headers: Record<string, string> = {};

				if (jwtToken) {
					headers["Authorization"] = `Bearer ${jwtToken}`;
				}

				try {
					// Get the collection attributes to find the target collection for the relation
					const filterField = settings.filterField!;

					// Fetch the schema to understand the relation
					const schemaResponse = await fetch(
						`/content-manager/collection-types/api::${filterField}.${filterField}?page=1&pageSize=100`,
						{
							headers,
						},
					);
					const schemaData = (await schemaResponse.json()) as {
						results: { id: number; documentId: string; name: string }[];
					};
					const options =
						schemaData.results?.map((data) => {
							return {
								id: data.documentId,
								label: data.name,
							};
						}) || [];

					setFilterOptions(options);
					setSelectedFilter(options[0]?.id || "");
				} catch (error) {
					console.error("Error fetching filter options:", error);
				}
			};

			fetchFilterOptions();
		} else {
			setFilterOptions([]);
			setSelectedFilter("");
		}
	}, [settings.filterEnabled, settings.filterField]);

	// Create event source function with JWT token in headers
	const eventSource: EventSourceFunc = useMemo(
		() => (fetchInfo, successCallback, failureCallback) => {
			if (settings.filterEnabled && !selectedFilter) {
				return;
			}

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

	// Handle event click
	const handleEventClick = (clickInfo: any) => {
		setSelectedEvent(clickInfo.event);
		setIsPreviewModalOpen(true);
	};

	// Handle create event
	const handleCreateEvent = async (eventData: EventFormData) => {
		try {
			await api.createEvent(eventData);
			// Refresh calendar
			setCalendarKey((prev) => prev + 1);
		} catch (error) {
			console.error("Error creating event:", error);
		}
	};

	// Handle update event
	const handleUpdateEvent = async (eventData: EventFormData) => {
		try {
			if (eventData.id) {
				await api.updateEvent(eventData.id, eventData);
				// Refresh calendar
				setCalendarKey((prev) => prev + 1);
			}
		} catch (error) {
			console.error("Error updating event:", error);
		}
	};

	// Handle delete event
	const handleDeleteEvent = async () => {
		try {
			if (selectedEvent?.id) {
				await api.deleteEvent(selectedEvent.id);
				setIsPreviewModalOpen(false);
				setSelectedEvent(null);
				// Refresh calendar
				setCalendarKey((prev) => prev + 1);
			}
		} catch (error) {
			console.error("Error deleting event:", error);
		}
	};

	// Handle edit button from preview
	const handleEditFromPreview = () => {
		// Prepare event data for editing
		const eventData: EventFormData = {
			id: selectedEvent.id,
			title: selectedEvent.title,
			start: selectedEvent.startStr,
			end: selectedEvent.endStr,
			description: selectedEvent.extendedProps?.description || "",
		};
		setEditEventData(eventData);
		setIsPreviewModalOpen(false);
		setIsEditModalOpen(true);
	};

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
		<Button
			startIcon={<Plus />}
			onClick={() => setIsCreateModalOpen(true)}
		>
			{formatMessage(
				{
					id: getTranslation("view.calendar.action.create-entry"),
					defaultMessage: "Create New",
				},
				{ collection: settings.collection?.split(".")[1] },
			)}
		</Button>
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
				primaryAction={
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
							>
								{filterOptions.map((option) => (
									<SingleSelectOption key={option.id} value={option.id}>
										{option.label}
									</SingleSelectOption>
								))}
							</SingleSelect>
						</Field.Root>
					</Box>
				}
				secondaryAction={primaryAction}
			/>
			<Layouts.Content>
				<Box padding={1} />
				<Box
					background={"neutral0"}
					shadow="filterShadow"
					padding={[5, 8]}
					hasRadius
					style={{
						zIndex: 0,
						position: "relative",
						marginBottom: "16px",
					}}
				>
					<style>{sty}</style>
					<FullCalendar
						ref={calendarRef}
						key={calendarKey}
						events={eventSource}
						plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
						initialView={initialView}
						slotMinTime={settings.startHour}
						slotMaxTime={settings.endHour}
						allDaySlot={false}
						timeZone="local"
						eventTimeFormat={{
							hour: "2-digit",
							minute: "2-digit",
							hour12: false,
							timeZoneName: "long",
						}}
						height={"auto"}
						headerToolbar={{
							start: left,
							center: "title",
							right: views,
						}}
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
						eventClick={handleEventClick}
					/>
				</Box>

				{/* Event Modals */}
				<EventModal
					isOpen={isCreateModalOpen}
					onClose={() => setIsCreateModalOpen(false)}
					onSubmit={handleCreateEvent}
					mode="create"
					settings={settings}
				/>

				<EventModal
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setEditEventData(null);
					}}
					onSubmit={handleUpdateEvent}
					initialData={editEventData}
					mode="edit"
					settings={settings}
				/>

				<EventPreviewModal
					isOpen={isPreviewModalOpen}
					onClose={() => {
						setIsPreviewModalOpen(false);
						setSelectedEvent(null);
					}}
					onEdit={handleEditFromPreview}
					onDelete={handleDeleteEvent}
					event={selectedEvent}
				/>
			</Layouts.Content>
		</>
	);
};

export default CalendarPage;
