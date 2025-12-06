"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const extensions_1 = __importDefault(require("./extensions"));
const utils_1 = require("../utils");
const service = ({ strapi }) => ({
    getData: async (start, end) => {
        const pluginStore = (0, utils_1.getPluginStore)();
        let config = await pluginStore.get({ key: 'settings' });
        if (!config)
            return [];
        const [startHandler, endHandler] = (0, utils_1.initHandlers)(config.startField, config.endField, extensions_1.default.getRegisteredExtensions());
        let data = {};
        if (startHandler) {
            data = await startHandler(start, end, strapi, config);
        }
        if (endHandler) {
            data = (0, deepmerge_1.default)(await endHandler(strapi, config, data), data);
        }
        // Filter out drafts if not configured to show them
        const dataFiltered = Object.values(data).filter((x) => {
            if (config.drafts)
                return true;
            return x.publishedAt;
        });
        // Map data into the required format
        return dataFiltered.map((x) => ({
            id: x.documentId,
            title: config.titleField ? x[config.titleField] : config.startField,
            start: x[config.startField],
            end: config.endField
                ? x[config.endField]
                : (0, moment_1.default)(x[config.startField]).add(config.defaultDuration, 'minutes'),
            backgroundColor: config.colorField && x[config.colorField] ? x[config.colorField] : config.eventColor,
            borderColor: config.colorField && x[config.colorField] ? x[config.colorField] : config.eventColor,
            url: `/admin/content-manager/collection-types/${config.collection}/${x.documentId}`,
        }));
    },
    /**
     * Retrieves all content types that are collection types.
     */
    getCollections: async () => {
        const types = strapi.contentTypes;
        return Object.values(types).filter((type) => type.kind === 'collectionType' && type.apiName);
    },
    /**
     * Retrieves all registered extensions.
     */
    getExtensions: async () => {
        return Object.entries(extensions_1.default.getRegisteredExtensions()).map(([id, extension]) => ({
            id,
            name: extension.name,
            startFields: extension.startFields,
            endFields: extension.endFields,
        }));
    },
    /**
     * Retrieves the current settings from the plugin store, or creates default settings if none exist.
     */
    getSettings: async () => {
        const pluginStore = (0, utils_1.getPluginStore)();
        let config = await pluginStore.get({ key: 'settings' });
        if (!config) {
            config = await (0, utils_1.createDefaultConfig)();
        }
        return config;
    },
    /**
     * Saves the provided settings to the plugin store.
     */
    setSettings: async (settings) => {
        const pluginStore = (0, utils_1.getPluginStore)();
        await pluginStore.set({ key: 'settings', value: settings });
        return pluginStore.get({ key: 'settings' });
    },
    /**
     * Clears the current settings from the plugin store.
     */
    clearSettings: async () => {
        const pluginStore = (0, utils_1.getPluginStore)();
        await pluginStore.set({ key: 'settings', value: null });
        return pluginStore.get({ key: 'settings' });
    },
});
exports.default = service;
