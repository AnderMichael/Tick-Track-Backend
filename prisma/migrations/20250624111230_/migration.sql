-- CreateTable
CREATE TABLE "department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "secondName" TEXT NOT NULL,
    "fatherLastName" TEXT NOT NULL,
    "motherLastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "upbCode" INTEGER NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL DEFAULT 'TickTrackNewUser',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "student" (
    "id" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrative" (
    "id" INTEGER NOT NULL,
    "upb_role" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commitment" (
    "id" SERIAL NOT NULL,
    "service_details_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "is_current" BOOLEAN NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_details" (
    "id" SERIAL NOT NULL,
    "scholarship_id" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "hours_per_semester" INTEGER NOT NULL,
    "total_hours" INTEGER NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarship" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semester" (
    "id" SERIAL NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscription" (
    "id" SERIAL NOT NULL,
    "commitment_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "inscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_begin" TEXT NOT NULL,
    "date_end" TEXT NOT NULL,
    "administrative_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_history" (
    "id" SERIAL NOT NULL,
    "work_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "work_id" INTEGER NOT NULL,
    "commitment_id" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "comment_student" TEXT,
    "comment_administrative" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "qualification_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualification" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "qualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_state_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_state_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrative" ADD CONSTRAINT "administrative_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commitment" ADD CONSTRAINT "commitment_service_details_id_fkey" FOREIGN KEY ("service_details_id") REFERENCES "service_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commitment" ADD CONSTRAINT "commitment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_details" ADD CONSTRAINT "service_details_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscription" ADD CONSTRAINT "inscription_commitment_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "commitment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscription" ADD CONSTRAINT "inscription_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work" ADD CONSTRAINT "work_administrative_id_fkey" FOREIGN KEY ("administrative_id") REFERENCES "administrative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work" ADD CONSTRAINT "work_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_history" ADD CONSTRAINT "work_history_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "administrative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_qualification_id_fkey" FOREIGN KEY ("qualification_id") REFERENCES "qualification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_commitment_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "commitment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_state_history" ADD CONSTRAINT "user_state_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX user_upbcode_unique_not_deleted
ON "user" ("upbCode")
WHERE is_deleted = false;

CREATE UNIQUE INDEX inscription_unique_not_deleted
ON "inscription" ("semester_id", "commitment_id")
WHERE is_deleted = false;