"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initHandlers = exports.createDefaultConfig = exports.getPluginStore = void 0;
const moment_1 = __importDefault(require("moment"));
const pluginId_1 = require("../../admin/src/pluginId");
const defaultSettings_1 = __importDefault(require("../../admin/src/utils/defaultSettings"));
/**
 * Retrieves the plugin store for this plugin.
 */
const getPluginStore = () => {
    return strapi.store({
        environment: '',
        type: 'plugin',
        name: pluginId_1.PLUGIN_ID,
    });
};
exports.getPluginStore = getPluginStore;
/**
 * Creates the default plugin configuration in the store if not already set.
 */
const createDefaultConfig = async () => {
    const pluginStore = (0, exports.getPluginStore)();
    await pluginStore.set({ key: 'settings', value: defaultSettings_1.default });
    return pluginStore.get({ key: 'settings' });
};
exports.createDefaultConfig = createDefaultConfig;
/**
 * Initializes the start and end handlers for retrieving data.
 * Handlers can be overridden by extensions if provided.
 *
 * @param {string} start - The start field identifier.
 * @param {string} end - The end field identifier.
 * @param {object} extensions - Registered extensions to override handlers.
 * @returns {[Function | undefined, Function | undefined]} Array containing startHandler and endHandler functions.
 */
const initHandlers = (start, end, extensions) => {
    // Default start handler
    let startHandler = async (startDate, endDate, strapi, config) => (await strapi.documents(config.collection).findMany({
        filters: {
            $and: [
                {
                    [config.startField]: {
                        $gte: (0, moment_1.default)(startDate).startOf('day').format(),
                        $lte: (0, moment_1.default)(endDate).endOf('day').format(),
                    },
                },
            ],
        },
    })).reduce((acc, el) => {
        acc[el.id] = el;
        return acc;
    }, {});
    let endHandler;
    // Override handlers if matching extension is found
    Object.entries(extensions).forEach(([id, extension]) => {
        if (id && start.startsWith(id)) {
            startHandler = extension.startHandler;
        }
        if (id && end.startsWith(id)) {
            endHandler = extension.endHandler;
        }
    });
    return [startHandler, endHandler];
};
exports.initHandlers = initHandlers;
