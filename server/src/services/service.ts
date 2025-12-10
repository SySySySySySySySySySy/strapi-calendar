import type { Core } from "@strapi/strapi";
import merge from "deepmerge";
import moment from "moment";
import type { SettingsType } from "../../../types";

import { createDefaultConfig, getPluginStore, initHandlers } from "../utils";
import extensionSystem from "./extensions";

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
	getData: async (
		start: string,
		end: string,
		user: any,
		filterValue?: string,
	): Promise<any[]> => {
		const pluginStore = getPluginStore();
		const config: SettingsType | null = await pluginStore.get({
			key: "settings",
		});
		if (!config) return [];

		const [startHandler, endHandler] = initHandlers(
			config.startField,
			config.endField,
			extensionSystem.getRegisteredExtensions(),
		);

		let data: Record<string, any> = {};
		if (startHandler) {
			data = await startHandler(start, end, strapi, config, user, filterValue);
		}
		if (endHandler) {
			data = merge(
				await endHandler(strapi, config, data, user, filterValue),
				data,
			);
		}

		// Map data into the required format
		return Object.values(data).map((x) => ({
			id: x.documentId,
			title: config.titleField ? x[config.titleField] : config.startField,
			start: x[config.startField],
			end: config.endField
				? x[config.endField]
				: moment(x[config.startField]).add(config.defaultDuration, "minutes"),
			backgroundColor:
				config.colorField && x[config.colorField]
					? x[config.colorField]
					: config.eventColor,
			borderColor:
				config.colorField && x[config.colorField]
					? x[config.colorField]
					: config.eventColor,
			url: `/admin/content-manager/collection-types/${config.collection}/${x.documentId}`,
		}));
	},

	/**
	 * Retrieves all content types that are collection types.
	 */
	getCollections: async (): Promise<any[]> => {
		const types = strapi.contentTypes;
		return Object.values(types).filter(
			(type) => type.kind === "collectionType" && type.apiName,
		);
	},

	/**
	 * Retrieves all registered extensions.
	 */
	getExtensions: async (): Promise<any[]> => {
		return Object.entries(extensionSystem.getRegisteredExtensions()).map(
			([id, extension]) => ({
				id,
				name: extension.name,
				startFields: extension.startFields,
				endFields: extension.endFields,
			}),
		);
	},

	/**
	 * Retrieves the current settings from the plugin store, or creates default settings if none exist.
	 */
	getSettings: async (): Promise<SettingsType> => {
		const pluginStore = getPluginStore();
		let config = await pluginStore.get({ key: "settings" });
		if (!config) {
			config = await createDefaultConfig();
		}
		return config;
	},

	/**
	 * Saves the provided settings to the plugin store.
	 */
	setSettings: async (settings: SettingsType): Promise<SettingsType> => {
		const pluginStore = getPluginStore();
		await pluginStore.set({ key: "settings", value: settings });
		return pluginStore.get({ key: "settings" });
	},

	/**
	 * Clears the current settings from the plugin store.
	 */
	clearSettings: async (): Promise<SettingsType> => {
		const pluginStore = getPluginStore();
		await pluginStore.set({ key: "settings", value: null });
		return pluginStore.get({ key: "settings" });
	},

	/**
	 * Creates a new event in the configured collection.
	 */
	createEvent: async (eventData: any, user: any): Promise<any> => {
		const pluginStore = getPluginStore();
		const config: SettingsType | null = await pluginStore.get({
			key: "settings",
		});
		if (!config || !config.collection) {
			throw new Error("Calendar not configured");
		}

		// Map event data to collection fields
		const data: any = {};
		if (config.titleField) {
			data[config.titleField] = eventData.title;
		}
		if (config.startField) {
			data[config.startField] = eventData.start;
		}
		if (config.endField) {
			data[config.endField] = eventData.end;
		}
		// Store description if there's a suitable field
		if (eventData.description) {
			data.description = eventData.description;
		}

		const result = await strapi.documents(config.collection as any).create({
			data,
			status: "published",
		});

		return result;
	},

	/**
	 * Updates an existing event in the configured collection.
	 */
	updateEvent: async (id: string, eventData: any, user: any): Promise<any> => {
		const pluginStore = getPluginStore();
		const config: SettingsType | null = await pluginStore.get({
			key: "settings",
		});
		if (!config || !config.collection) {
			throw new Error("Calendar not configured");
		}

		// Map event data to collection fields
		const data: any = {};
		if (config.titleField && eventData.title) {
			data[config.titleField] = eventData.title;
		}
		if (config.startField && eventData.start) {
			data[config.startField] = eventData.start;
		}
		if (config.endField && eventData.end) {
			data[config.endField] = eventData.end;
		}
		// Store description if there's a suitable field
		if (eventData.description !== undefined) {
			data.description = eventData.description;
		}

		const result = await strapi.documents(config.collection as any).update({
			documentId: id,
			data,
		});

		return result;
	},

	/**
	 * Deletes an event from the configured collection.
	 */
	deleteEvent: async (id: string, user: any): Promise<any> => {
		const pluginStore = getPluginStore();
		const config: SettingsType | null = await pluginStore.get({
			key: "settings",
		});
		if (!config || !config.collection) {
			throw new Error("Calendar not configured");
		}

		const result = await strapi.documents(config.collection as any).delete({
			documentId: id,
		});

		return result;
	},
});

export default service;
