import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { logger } from "@vendetta";

const ChannelStore = findByProps("getChannel", "getChannels");
const PermissionUtils = findByProps("can", "hasChannelPermission");
const CurrentUserStore = findByProps("getCurrentUser");
const GuildStore = findByProps("getGuild");

let patches = [];

export default {
  onLoad: () => {
    logger.log("Loaded Hidden Channel Revealer 😈");

    patches.push(
      before("getChannels", ChannelStore, ([guildId]) => {
        const original = ChannelStore.getChannels(guildId);
        const modified = { ...original };

        for (const category in original) {
          modified[category] = original[category].map((channel) => {
            const userId = CurrentUserStore.getCurrentUser().id;
            const canView = PermissionUtils.can(
              PermissionUtils.PermissionFlags.VIEW_CHANNEL,
              channel,
              userId
            );

            if (!canView) {
              channel.name = `🔒 ${channel.name}`;
              // If needed, set a dummy topic too
              channel.topic = "Hidden channel (no VIEW_CHANNEL)";
            }

            return channel;
          });
        }

        return [modified];
      })
    );
  },

  onUnload: () => {
    logger.log("Unloaded Hidden Channel Revealer 👋");
    for (const unpatch of patches) unpatch();
    patches = [];
  },
};
