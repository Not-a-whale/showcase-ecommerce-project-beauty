import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayments1790000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "payments_status_enum" AS ENUM ('CREATED', 'PROCESSING', 'SUCCEEDED', 'FAILED')
    `);

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" character varying NOT NULL,
        "stripePaymentIntentId" character varying(255),
        "amount" numeric(10,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'usd',
        "status" "payments_status_enum" NOT NULL DEFAULT 'CREATED',
        "attempts" integer NOT NULL DEFAULT 0,
        "lastError" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_payments_stripePaymentIntentId" UNIQUE ("stripePaymentIntentId")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_orderId" ON "payments" ("orderId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_payments_stripePaymentIntentId" ON "payments" ("stripePaymentIntentId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_stripePaymentIntentId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_orderId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payments_status_enum"`);
  }
}
