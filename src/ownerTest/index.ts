export async function OnPlayerDeployed(eventPlayer: mod.Player): Promise<void> {
    await mod.Wait(3);
    const pos = mod.GetSoldierState(eventPlayer, mod.SoldierStateVector.GetPosition);
    const dir = mod.GetSoldierState(eventPlayer, mod.SoldierStateVector.GetFacingDirection);
    const dirTimes10 = mod.Add(mod.Multiply(dir, 10), pos);
    const dirTimes3 = mod.Add(mod.Multiply(dir, 3), pos);

    const mcom1: mod.MCOM = mod.SpawnObject(mod.RuntimeSpawn_Common.MCOM, dirTimes3, mod.CreateVector(0, 0, 0), mod.CreateVector(1, 1, 1)) as mod.MCOM;
    const mcom2: mod.MCOM = mod.SpawnObject(mod.RuntimeSpawn_Common.MCOM, dirTimes10, mod.CreateVector(0, 0, 0), mod.CreateVector(1, 1, 1)) as mod.MCOM;

    await mod.Wait(1);

    mod.SetMCOMOwner(mcom1, mod.GetTeam(1));
    mod.SetMCOMOwner(mcom2, mod.GetTeam(2));

    await mod.Wait(3);

    const mcom1Id = mod.GetObjId(mcom1);
    const mcom2Id = mod.GetObjId(mcom2);
    const mcom1Object = mod.GetMCOM(mcom1Id);
    const mcom2Object = mod.GetMCOM(mcom2Id);

    mod.SetMCOMOwner(mcom1Object, mod.GetTeam(2));
    mod.SetMCOMOwner(mcom2Object, mod.GetTeam(1));


    await mod.Wait(3);

    mod.UnspawnObject(mcom1Object);
    mod.UnspawnObject(mcom2Object);

    await mod.Wait(3);

    const cap1: mod.CapturePoint = mod.SpawnObject(mod.RuntimeSpawn_Common.CapturePoint, dirTimes3, mod.CreateVector(0, 0, 0), mod.CreateVector(1, 1, 1)) as mod.CapturePoint;
    const cap2: mod.CapturePoint = mod.SpawnObject(mod.RuntimeSpawn_Common.CapturePoint, dirTimes10, mod.CreateVector(0, 0, 0), mod.CreateVector(1, 1, 1)) as mod.CapturePoint;

    await mod.Wait(1);

    mod.SetCapturePointOwner(cap1, mod.GetTeam(1));
    mod.SetCapturePointOwner(cap2, mod.GetTeam(2));

    await mod.Wait(3);

    const cap1Id = mod.GetObjId(cap1);
    const cap2Id = mod.GetObjId(cap2);
    const cap1Object = mod.GetCapturePoint(cap1Id);
    const cap2Object = mod.GetCapturePoint(cap2Id);

    mod.SetCapturePointOwner(cap1Object, mod.GetTeam(2));
    mod.SetCapturePointOwner(cap2Object, mod.GetTeam(1));
}