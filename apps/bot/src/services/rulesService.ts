import { EmbedBuilder, TextChannel } from "discord.js";
import { VY_BRAND, VY_COLORS } from "../embeds/brand.js";

export class RulesService {
  /**
   * Builds the official Vyntric Tierlist Information & Guide embed matching Ruthless/MCTiers standards.
   */
  public static buildRulesEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(0x7c3aed) // Vyntric Purple
      .setTitle("🏆 Vyntric Tierlist — Information & Testing Guide")
      .setDescription(
        `Welcome to **Vyntric Tierlist** (*Ranked. Tested. Verified.*)! This guide explains how our profile verification, waiting list, active queues, and testing rooms operate. Please review carefully.\n\n` +
        `---\n\n` +
        `### 1️⃣ Step One: Profile Verification\n` +
        `Before you can join any queue or get evaluated, you must link your Minecraft Java account.\n` +
        `• Go to <#verify> or click the **[Verify Account]** button on any ladder panel.\n` +
        `• You will receive a direct connection server address (e.g. \`connect.vyntric.gg\` or auth code).\n` +
        `• Connect in Minecraft Multiplayer via Direct Connect, or click **[Instant Verify]** for cracked/fast verify.\n` +
        `• Once verified, your server nickname is set to \`{IGN} [{Region}]\` and you receive the **Registered** role.\n\n` +
        `---\n\n` +
        `### 2️⃣ Step Two: Select Gamemode Waitlist Roles\n` +
        `Want to get pinged whenever a tester opens a queue for your preferred gamemode?\n` +
        `• Head over to <#pick-gamemodes>.\n` +
        `• Select your competitive gamemodes from the dropdown menu (Sword, Axe, Crystal, Pot, UHC, SMP, Mace, Dia SMP, Vanilla).\n` +
        `• Selecting a ladder automatically reveals its queue channel in your sidebar and grants you the waitlist ping role!\n\n` +
        `---\n\n` +
        `### 3️⃣ Waitlist vs. Active Queue\n` +
        `**What is the Waitlist?**\n` +
        `Being in the waitlist simply means you are registered to be tested at some point. It does not mean you are going to be tested right away. Please be patient!\n\n` +
        `**What is the Active Queue?**\n` +
        `The queue is what you join once you are ready to actually test. When a tester for your region becomes available, \`@here\` / gamemode role will be pinged with a button to join the queue. This is meant for players readily available to log on for their evaluation test.\n\n` +
        `• **No Testers Online:** If no testers are available, the queue remains closed and you will not see the queue button until a tester marks themselves active. The panel will display \`No Testers Online\` with the timestamp of the last session.\n` +
        `• **Queue Closure:** When a tester marks themselves unavailable with no other testers active, the queue closes. You can re-enter when a tester opens the session again.\n` +
        `• **Leaving the Queue:** If you decide you no longer want to be tested or have to leave, run \`/leave\` in the commands channel.\n\n` +
        `---\n\n` +
        `### ❓ "Why am I not getting tested, I'm #1 in the queue?"\n` +
        `\`\`\`\n` +
        `┌──────────────────────┐          ┌───────────────────────────────────┐\n` +
        `│      THE QUEUE       │  ═════>  │           TESTING ROOM            │\n` +
        `│  ● [#1] You          │          │  ● [Previous Testee]              │\n` +
        `│  ● [#2] Waiting      │          │  ⚔️  VS                           │\n` +
        `│  ● [#3] Waiting      │          │  🔴 [Tier Tester] (FT5 Duel)      │\n` +
        `└──────────────────────┘          └───────────────────────────────────┘\n` +
        `                                     ▲\n` +
        `                                     │\n` +
        ` (You must wait for the previous #1 to finish their test in the room!)\n` +
        `\`\`\`\n` +
        `When you are #1 in the queue, your tester is finishing their active First-to-5 (FT5) match with the previous testee in the private testing room. Once completed, the tester will summon you into a private testing room!\n\n` +
        `---\n\n` +
        `### 4️⃣ Evaluation Ranks & Tier Results\n` +
        `We test across 9 competitive gamemodes. Ranks range from **LT5 / HT5** up to elite competitive tiers (**HT1**). After concluding your FT5 duel, your tester will record your tier rating with \`/result\` or \`/close\`, updating your role and publishing your official dossier card to <#results>!`
      )
      .setFooter({
        text: `${VY_BRAND.footerText} • Ranked. Tested. Verified.`,
        iconURL: VY_BRAND.logoIcon,
      });
  }

  /**
   * Posts or updates the guide panel in #rules or #tiertesting-info.
   */
  public static async setupRulesPanel(channel: TextChannel): Promise<void> {
    try {
      const embed = this.buildRulesEmbed();
      const messages = await channel.messages.fetch({ limit: 10 }).catch(() => null);
      if (messages && messages.size > 0) {
        for (const m of Array.from(messages.values())) {
          await m.delete().catch(() => null);
        }
      }
      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.warn("Failed to post rules/guide panel:", err);
    }
  }
}
