import { Events } from 'bf6-portal-utils/events';

interface OOBSector {
    spatialId: number;
    areaTriggerId: number;
    currentOwner: mod.Team;
}

interface OOBPlayerData {
    /** effectively there should only be one active area ata time, 
     * but there might be edge cases when transitioning between areas */
    inAreas: number[];
    /** The timestamp when the player first left the combat zone 
     * or entered enemy territory */
    oobStart: number | null;
}

/**
 * Handles out-of-bounds logic for custom sector setups.
 * It tracks which sectors players are in and applies penalties if they are in enemy-controlled sectors or outside of all sectors for too long.
 * The sector ownership can be updated dynamically during the game, allowing for flexible game modes and objectives.
 * 
 * How it works:
 * - Each sector must be having an area trigger assigned to the sectors polygon volume with a specific ID.
 * - Sectors for this module are stored in a Map<number, number> where the key is the area trigger ID and the value is the owning team ID (0 for neutral).
 * 
 */
class OutOfBounds {

    public static readonly neutralTeamId = mod.GetObjId(mod.GetTeam(0));

    /** Whether out-of-bounds alerts are enabled (player is not within any sector) */
    public static enableOOBAlert = true;

    /** Whether enemy sector alerts are enabled (player is within an enemy-controlled sector) */
    public static enableEnemySectorAlert = true;

    /** Whether/how players in enemy-controlled sectors are being spotted/highlighted */
    public static enableEnemySectorSpotting: mod.SpotStatus = mod.SpotStatus.SpotInMinimap;

    /** Whether players in enemy-controlled sectors will be killed after grace period */
    public static enableEnemySectorKilling = true;

    /** Grace period before a player is considered for punishment when out of bounds */
    public static oobGracePeriod = 5000;

    // Areatrigger IDs 601-604 are the OOB sectors, with ownership that can change during the game
    public static sectors: Map<number, number> = new Map();

    private static playerData: Map<number, OOBPlayerData> = new Map();

    public static init(): void {
        Events.OnPlayerJoinGame.subscribe((eventPlayer: mod.Player) => {
            OutOfBounds.playerData.set(mod.GetObjId(eventPlayer), { inAreas: [], oobStart: null });
        });
        Events.OnPlayerLeaveGame.subscribe((playerId: number) => {
            OutOfBounds.playerData.delete(playerId);
        });

        Events.OnPlayerEnterAreaTrigger.subscribe((eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
            const playerId = mod.GetObjId(eventPlayer);
            const playerData = OutOfBounds.playerData.get(playerId)!;
            const areaTriggerId = mod.GetObjId(eventAreaTrigger);
            const teamId = mod.GetObjId(mod.GetTeam(eventPlayer));
            if (!playerData.inAreas.includes(areaTriggerId)) {

            }
            playerData.inAreas.push(areaTriggerId);
        });

        Events.OnPlayerExitAreaTrigger.subscribe(async (eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger) => {
            const playerId = mod.GetObjId(eventPlayer);
            const playerData = OutOfBounds.playerData.get(playerId)!;
            const areaTriggerId = mod.GetObjId(eventAreaTrigger);
            const teamId = mod.GetObjId(mod.GetTeam(eventPlayer));
            const index = playerData.inAreas.indexOf(areaTriggerId);
            if (index !== -1) {
                playerData.inAreas.splice(index, 1);
            }
        });

        Events.OnPlayerDeployed.subscribe((eventPlayer: mod.Player) => {
            mod.SkipManDown(eventPlayer, false);
            // Immediately check if the player is out of bounds upon deployment
            // and undeploy them if they are so they can redeploy in the correct location
            // TODO 
        });

        Events.OnPlayerUndeploy.subscribe((eventPlayer: mod.Player) => {
            mod.SkipManDown(eventPlayer, false);
            // 
        });

        Events.OngoingPlayer.subscribe((eventPlayer: mod.Player) => {
            const playerId = mod.GetObjId(eventPlayer);
            const playerData = OutOfBounds.playerData.get(playerId)!;
            const teamId = mod.GetObjId(mod.GetTeam(eventPlayer));
            playerData.inAreas.some((areaTriggerId) => {
                // Check if the area trigger corresponds to an OOB sector and if the player is on the wrong team
                if (
                    this.sectors.has(areaTriggerId) &&
                    this.sectors.get(areaTriggerId) !== teamId &&
                    this.sectors.get(areaTriggerId) !== this.neutralTeamId &&
                    playerData.oobStart === null
                ) {
                    playerData.oobStart = Date.now();
                }
            });
            OutOfBounds.updateOutOfBoundsUI(eventPlayer);
        });
    }

    private static updateOutOfBoundsUI(player: mod.Player): void {
        const playerId = mod.GetObjId(player);
        const playerData = OutOfBounds.playerData.get(playerId)!;
        if (playerData.oobStart !== null) {
            const elapsed = Date.now() - playerData.oobStart;
            if (elapsed >= OutOfBounds.oobGracePeriod) {
                mod.Kill(player);
            }
        }
    }
}