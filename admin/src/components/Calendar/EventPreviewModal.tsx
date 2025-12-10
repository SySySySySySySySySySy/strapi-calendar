import { Button, Dialog, Flex, Typography } from "@strapi/design-system";
import { Pencil, Trash } from "@strapi/icons";
import moment from "moment";
import { useIntl } from "react-intl";
import { getTranslation } from "../../utils/getTranslation";

interface EventPreviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	onEdit: () => void;
	onDelete: () => void;
	event: any;
}

const EventPreviewModal = ({
	isOpen,
	onClose,
	onEdit,
	onDelete,
	event,
}: EventPreviewModalProps) => {
	const { formatMessage } = useIntl();

	if (!event) return null;

	return (
		<Dialog.Root open={isOpen} onOpenChange={onClose}>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>
						{formatMessage({
							id: getTranslation("modal.preview.title"),
							defaultMessage: "Event Details",
						})}
					</Dialog.Title>
				</Dialog.Header>
				<Dialog.Body>
					<Flex direction="column" gap={4}>
						<div>
							<Typography variant="sigma" textColor="neutral600">
								{formatMessage({
									id: getTranslation("modal.preview.field.title"),
									defaultMessage: "Title",
								})}
							</Typography>
							<Typography variant="omega" fontWeight="bold">
								{event.title}
							</Typography>
						</div>

						<div>
							<Typography variant="sigma" textColor="neutral600">
								{formatMessage({
									id: getTranslation("modal.preview.field.start"),
									defaultMessage: "Start",
								})}
							</Typography>
							<Typography variant="omega">
								{moment(event.start).format("MMMM Do YYYY, h:mm A")}
							</Typography>
						</div>

						<div>
							<Typography variant="sigma" textColor="neutral600">
								{formatMessage({
									id: getTranslation("modal.preview.field.end"),
									defaultMessage: "End",
								})}
							</Typography>
							<Typography variant="omega">
								{moment(event.end).format("MMMM Do YYYY, h:mm A")}
							</Typography>
						</div>

						{event.extendedProps?.description && (
							<div>
								<Typography variant="sigma" textColor="neutral600">
									{formatMessage({
										id: getTranslation("modal.preview.field.description"),
										defaultMessage: "Description",
									})}
								</Typography>
								<Typography variant="omega">
									{event.extendedProps.description}
								</Typography>
							</div>
						)}
					</Flex>
				</Dialog.Body>
				<Dialog.Footer>
					<Flex gap={2}>
						<Button onClick={onClose} variant="tertiary">
							{formatMessage({
								id: getTranslation("modal.preview.action.close"),
								defaultMessage: "Close",
							})}
						</Button>
						<Button onClick={onDelete} variant="danger" startIcon={<Trash />}>
							{formatMessage({
								id: getTranslation("modal.preview.action.delete"),
								defaultMessage: "Delete",
							})}
						</Button>
						<Button onClick={onEdit} variant="default" startIcon={<Pencil />}>
							{formatMessage({
								id: getTranslation("modal.preview.action.edit"),
								defaultMessage: "Edit",
							})}
						</Button>
					</Flex>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	);
};

export default EventPreviewModal;
