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
INSERT INTO Permission VALUES('clr6jrd7c000011fd4nm768rq','create','user','own','',1704816555673,1704816555673);
INSERT INTO Permission VALUES('clr6jrd7i000111fdl4m8wcso','create','user','any','',1704816555678,1704816555678);
INSERT INTO Permission VALUES('clr6jrd7k000211fduaok077o','read','user','own','',1704816555680,1704816555680);
INSERT INTO Permission VALUES('clr6jrd7l000311fdqp5zoy3v','read','user','any','',1704816555681,1704816555681);
INSERT INTO Permission VALUES('clr6jrd7m000411fdgstz41ai','update','user','own','',1704816555682,1704816555682);
INSERT INTO Permission VALUES('clr6jrd7n000511fdtwdlpuml','update','user','any','',1704816555683,1704816555683);
INSERT INTO Permission VALUES('clr6jrd7n000611fdjlv1sncf','delete','user','own','',1704816555684,1704816555684);
INSERT INTO Permission VALUES('clr6jrd7o000711fd3715m7yu','delete','user','any','',1704816555685,1704816555685);
INSERT INTO Permission VALUES('clr6jrd7q000811fdxxct1hw1','create','note','own','',1704816555686,1704816555686);
INSERT INTO Permission VALUES('clr6jrd7r000911fd4hq0xohe','create','note','any','',1704816555687,1704816555687);
INSERT INTO Permission VALUES('clr6jrd7s000a11fdyhyg54q9','read','note','own','',1704816555688,1704816555688);
INSERT INTO Permission VALUES('clr6jrd7t000b11fd9yh0a22s','read','note','any','',1704816555689,1704816555689);
INSERT INTO Permission VALUES('clr6jrd7t000c11fdo28w4c7v','update','note','own','',1704816555690,1704816555690);
INSERT INTO Permission VALUES('clr6jrd7u000d11fdfsdbb78d','update','note','any','',1704816555691,1704816555691);
INSERT INTO Permission VALUES('clr6jrd7v000e11fdqxy5ezfu','delete','note','own','',1704816555692,1704816555692);
INSERT INTO Permission VALUES('clr6jrd7w000f11fd2udm3wef','delete','note','any','',1704816555693,1704816555693);

INSERT INTO Role VALUES('clr6jrd7y000g11fd4jfno3oi','admin','',1704816555695,1704816555695);
INSERT INTO Role VALUES('clr6jrd81000h11fdb9mj8b8j','user','',1704816555697,1704816555697);

INSERT INTO _PermissionToRole VALUES('clr6jrd7i000111fdl4m8wcso','clr6jrd7y000g11fd4jfno3oi');
INSERT INTO _PermissionToRole VALUES('clr6jrd7l000311fdqp5zoy3v','clr6jrd7y000g11fd4jfno3oi');
INSERT INTO _PermissionToRole VALUES('clr6jrd7n000511fdtwdlpuml','clr6jrd7y000g11fd4jfno3oi');
INSERT INTO _PermissionToRole VALUES('clr6jrd7o000711fd3715m7yu','clr6jrd7y000g11fd4jfno3oi');
INSERT INTO _PermissionToRole VALUES('clr6jrd7r000911fd4hq0xohe','clr6jrd7y000g11fd4jfno3oi');
INSERT INTO _PermissionToRole VALUES('clr6jrd7t000b11fd9yh0a22s','clr6jrd7y000g11fd4jfno3oi');
INSERT INTO _PermissionToRole VALUES('clr6jrd7u000d11fdfsdbb78d','clr6jrd7y000g11fd4jfno3oi');
INSERT INTO _PermissionToRole VALUES('clr6jrd7w000f11fd2udm3wef','clr6jrd7y000g11fd4jfno3oi');
INSERT INTO _PermissionToRole VALUES('clr6jrd7c000011fd4nm768rq','clr6jrd81000h11fdb9mj8b8j');
INSERT INTO _PermissionToRole VALUES('clr6jrd7k000211fduaok077o','clr6jrd81000h11fdb9mj8b8j');
INSERT INTO _PermissionToRole VALUES('clr6jrd7m000411fdgstz41ai','clr6jrd81000h11fdb9mj8b8j');
INSERT INTO _PermissionToRole VALUES('clr6jrd7n000611fdjlv1sncf','clr6jrd81000h11fdb9mj8b8j');
INSERT INTO _PermissionToRole VALUES('clr6jrd7q000811fdxxct1hw1','clr6jrd81000h11fdb9mj8b8j');
INSERT INTO _PermissionToRole VALUES('clr6jrd7s000a11fdyhyg54q9','clr6jrd81000h11fdb9mj8b8j');
INSERT INTO _PermissionToRole VALUES('clr6jrd7t000c11fdo28w4c7v','clr6jrd81000h11fdb9mj8b8j');
INSERT INTO _PermissionToRole VALUES('clr6jrd7v000e11fdqxy5ezfu','clr6jrd81000h11fdb9mj8b8j');