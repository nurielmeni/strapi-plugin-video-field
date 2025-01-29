import { getTranslation } from './utils/getTranslation';
import FieldIcon from './components/Field/Icon';
import { Initializer } from './components/Initializer';
import { PLUGIN_ID } from './pluginId';
import { prefixPluginTranslations } from './utils/prefixPluginTranslations';

interface StrapiAdminAPI {
    addMenuLink: (config: MenuLinkConfig) => void;
    registerPlugin: (config: PluginConfig) => any;
    createSettingSection: (section: SettingSectionConfig, links: SettingLinkConfig[]) => void;
    getPlugin: (pluginId: string) => any;
}

interface MenuLinkConfig {
    to: string;
    icon: React.ComponentType;
    intlLabel: {
        id: string;
        defaultMessage: string;
    };
    Component: () => Promise<any>;
}

interface PluginConfig {
    id: string;
    initializer: React.ComponentType<{ setPlugin: (pluginId: string) => void }>;
    isReady: boolean;
    name: string;
}

interface SettingSectionConfig {
    id: string;
    intlLabel: {
        id: string;
        defaultMessage: string;
    };
}

interface SettingLinkConfig {
    intlLabel: {
        id: string;
        defaultMessage: string;
    };
    id: string;
    to: string;
    Component: () => Promise<any>;
}

export default {
    register(app: any) {
        app.customFields.register({
            name: 'video',
            pluginId: PLUGIN_ID,
            type: 'json',
            icon: FieldIcon,
            intlLabel: {
                id: getTranslation('video-field.label'),
                defaultMessage: 'Video',
            },
            intlDescription: {
                id: getTranslation('video-field.description'),
                defaultMessage: 'Video field for YouTube or Vimeo.',
            },
            components: {
                Input: async () =>
                    import(/* webpackChunkName: "video-field-input-component" */ './components/Field/Input'),
            },
        });

        app.registerPlugin({
            id: PLUGIN_ID,
            initializer: Initializer,
            isReady: false,
            name: PLUGIN_ID,
        });
    },

    bootstrap(app: StrapiAdminAPI) {
        console.log(`[${PLUGIN_ID}] Bootstrap started`);
        const plugin = app.getPlugin(PLUGIN_ID);

        if (plugin) {
            console.log(`[${PLUGIN_ID}] Setting plugin as ready`);
            plugin.isReady = true;
        } else {
            console.warn(`[${PLUGIN_ID}] Plugin not found during bootstrap`);
        }

        console.log(`[${PLUGIN_ID}] Bootstrap completed`);
    },

    async registerTrads(app: any) {
        const { locales } = app;

        const importedTranslations = await Promise.all(
            (locales as string[]).map((locale) => {
                return import(`./translations/${locale}.json`)
                    .then(({ default: data }) => {
                        return {
                            data: prefixPluginTranslations(data, PLUGIN_ID),
                            locale,
                        };
                    })
                    .catch(() => {
                        return {
                            data: {},
                            locale,
                        };
                    });
            }),
        );

        return importedTranslations;
    },
};
