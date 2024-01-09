-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

--------------------------------- Manual Seeding --------------------------
INSERT INTO Permission VALUES('clr6k41nh0000lqcc0619cjv8','create','user','own','',1704817147229,1704817147229);
INSERT INTO Permission VALUES('clr6k41nm0001lqcc799geo5b','create','user','any','',1704817147235,1704817147235);
INSERT INTO Permission VALUES('clr6k41no0002lqccfzv431rb','read','user','own','',1704817147236,1704817147236);
INSERT INTO Permission VALUES('clr6k41np0003lqcca92fxgq9','read','user','any','',1704817147237,1704817147237);
INSERT INTO Permission VALUES('clr6k41nq0004lqcc8xhpp266','update','user','own','',1704817147238,1704817147238);
INSERT INTO Permission VALUES('clr6k41nr0005lqcczqxp6jp4','update','user','any','',1704817147239,1704817147239);
INSERT INTO Permission VALUES('clr6k41nr0006lqccs87seiez','delete','user','own','',1704817147240,1704817147240);
INSERT INTO Permission VALUES('clr6k41ns0007lqcchg53vfn4','delete','user','any','',1704817147241,1704817147241);
INSERT INTO Permission VALUES('clr6k41nu0008lqccluybn6ui','create','note','own','',1704817147243,1704817147243);
INSERT INTO Permission VALUES('clr6k41nv0009lqccnn8u973f','create','note','any','',1704817147244,1704817147244);
INSERT INTO Permission VALUES('clr6k41nw000alqccs1sf14oy','read','note','own','',1704817147245,1704817147245);
INSERT INTO Permission VALUES('clr6k41nx000blqcci3etxsye','read','note','any','',1704817147245,1704817147245);
INSERT INTO Permission VALUES('clr6k41ny000clqccz5662rq0','update','note','own','',1704817147246,1704817147246);
INSERT INTO Permission VALUES('clr6k41nz000dlqccpz46ljxc','update','note','any','',1704817147247,1704817147247);
INSERT INTO Permission VALUES('clr6k41o0000elqcc9jsx1njl','delete','note','own','',1704817147248,1704817147248);
INSERT INTO Permission VALUES('clr6k41o0000flqccgrubtb4b','delete','note','any','',1704817147249,1704817147249);

INSERT INTO Role VALUES('clr6k41o2000glqccpf94v7ox','admin','',1704817147251,1704817147251);
INSERT INTO Role VALUES('clr6k41o4000hlqccgo81wmkv','user','',1704817147252,1704817147252);

INSERT INTO _PermissionToRole VALUES('clr6k41nm0001lqcc799geo5b','clr6k41o2000glqccpf94v7ox');
INSERT INTO _PermissionToRole VALUES('clr6k41np0003lqcca92fxgq9','clr6k41o2000glqccpf94v7ox');
INSERT INTO _PermissionToRole VALUES('clr6k41nr0005lqcczqxp6jp4','clr6k41o2000glqccpf94v7ox');
INSERT INTO _PermissionToRole VALUES('clr6k41ns0007lqcchg53vfn4','clr6k41o2000glqccpf94v7ox');
INSERT INTO _PermissionToRole VALUES('clr6k41nv0009lqccnn8u973f','clr6k41o2000glqccpf94v7ox');
INSERT INTO _PermissionToRole VALUES('clr6k41nx000blqcci3etxsye','clr6k41o2000glqccpf94v7ox');
INSERT INTO _PermissionToRole VALUES('clr6k41nz000dlqccpz46ljxc','clr6k41o2000glqccpf94v7ox');
INSERT INTO _PermissionToRole VALUES('clr6k41o0000flqccgrubtb4b','clr6k41o2000glqccpf94v7ox');
INSERT INTO _PermissionToRole VALUES('clr6k41nh0000lqcc0619cjv8','clr6k41o4000hlqccgo81wmkv');
INSERT INTO _PermissionToRole VALUES('clr6k41no0002lqccfzv431rb','clr6k41o4000hlqccgo81wmkv');
INSERT INTO _PermissionToRole VALUES('clr6k41nq0004lqcc8xhpp266','clr6k41o4000hlqccgo81wmkv');
INSERT INTO _PermissionToRole VALUES('clr6k41nr0006lqccs87seiez','clr6k41o4000hlqccgo81wmkv');
INSERT INTO _PermissionToRole VALUES('clr6k41nu0008lqccluybn6ui','clr6k41o4000hlqccgo81wmkv');
INSERT INTO _PermissionToRole VALUES('clr6k41nw000alqccs1sf14oy','clr6k41o4000hlqccgo81wmkv');
INSERT INTO _PermissionToRole VALUES('clr6k41ny000clqccz5662rq0','clr6k41o4000hlqccgo81wmkv');
INSERT INTO _PermissionToRole VALUES('clr6k41o0000elqcc9jsx1njl','clr6k41o4000hlqccgo81wmkv');
