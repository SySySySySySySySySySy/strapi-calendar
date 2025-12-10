import {
	Button,
	Dialog,
	Field,
	Flex,
	Textarea,
	TextInput,
} from "@strapi/design-system";
import { DateTimePicker } from "@strapi/design-system";
import moment from "moment";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { getTranslation } from "../../utils/getTranslation";

interface EventModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (eventData: EventFormData) => void;
	initialData?: EventFormData | null;
	mode: "create" | "edit";
	settings: any;
}

export interface EventFormData {
	id?: string;
	title: string;
	start: string;
	end: string;
	description?: string;
	[key: string]: any;
}

const EventModal = ({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	mode,
	settings,
}: EventModalProps) => {
	const { formatMessage } = useIntl();
	const [formData, setFormData] = useState<EventFormData>({
		title: "",
		start: moment().format("YYYY-MM-DDTHH:mm"),
		end: moment().add(1, "hour").format("YYYY-MM-DDTHH:mm"),
		description: "",
	});

	useEffect(() => {
		if (initialData) {
			setFormData({
				...initialData,
				start: moment(initialData.start).format("YYYY-MM-DDTHH:mm"),
				end: moment(initialData.end).format("YYYY-MM-DDTHH:mm"),
			});
		} else {
			setFormData({
				title: "",
				start: moment().format("YYYY-MM-DDTHH:mm"),
				end: moment().add(1, "hour").format("YYYY-MM-DDTHH:mm"),
				description: "",
			});
		}
	}, [initialData, isOpen]);

	const handleSubmit = () => {
		// Validate form
		if (!formData.title || !formData.start || !formData.end) {
			return;
		}

		// Convert to ISO format for submission
		const submissionData = {
			...formData,
			start: moment(formData.start).toISOString(),
			end: moment(formData.end).toISOString(),
		};

		onSubmit(submissionData);
		onClose();
	};

	return (
		<Dialog.Root open={isOpen} onOpenChange={onClose}>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>
						{mode === "create"
							? formatMessage({
									id: getTranslation("modal.event.create.title"),
									defaultMessage: "Create Event",
								})
							: formatMessage({
									id: getTranslation("modal.event.edit.title"),
									defaultMessage: "Edit Event",
								})}
					</Dialog.Title>
				</Dialog.Header>
				<Dialog.Body>
					<Flex direction="column" gap={4}>
						<Field.Root name="title" required>
							<Field.Label>
								{formatMessage({
									id: getTranslation("modal.event.field.title"),
									defaultMessage: "Event Title",
								})}
							</Field.Label>
							<TextInput
								value={formData.title}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder={formatMessage({
									id: getTranslation("modal.event.field.title.placeholder"),
									defaultMessage: "Enter event title",
								})}
							/>
						</Field.Root>

						<Field.Root name="start" required>
							<Field.Label>
								{formatMessage({
									id: getTranslation("modal.event.field.start"),
									defaultMessage: "Start Date & Time",
								})}
							</Field.Label>
							<TextInput
								type="datetime-local"
								value={formData.start}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFormData({ ...formData, start: e.target.value })
								}
							/>
						</Field.Root>

						<Field.Root name="end" required>
							<Field.Label>
								{formatMessage({
									id: getTranslation("modal.event.field.end"),
									defaultMessage: "End Date & Time",
								})}
							</Field.Label>
							<TextInput
								type="datetime-local"
								value={formData.end}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFormData({ ...formData, end: e.target.value })
								}
							/>
						</Field.Root>

						<Field.Root name="description">
							<Field.Label>
								{formatMessage({
									id: getTranslation("modal.event.field.description"),
									defaultMessage: "Description",
								})}
							</Field.Label>
							<Textarea
								value={formData.description || ""}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder={formatMessage({
									id: getTranslation(
										"modal.event.field.description.placeholder",
									),
									defaultMessage: "Enter event description",
								})}
							/>
						</Field.Root>
					</Flex>
				</Dialog.Body>
				<Dialog.Footer>
					<Button onClick={onClose} variant="tertiary">
						{formatMessage({
							id: getTranslation("modal.event.action.cancel"),
							defaultMessage: "Cancel",
						})}
					</Button>
					<Button onClick={handleSubmit} variant="default">
						{mode === "create"
							? formatMessage({
									id: getTranslation("modal.event.action.create"),
									defaultMessage: "Create",
								})
							: formatMessage({
									id: getTranslation("modal.event.action.save"),
									defaultMessage: "Save",
								})}
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	);
};

export default EventModal;
