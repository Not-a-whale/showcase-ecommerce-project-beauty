import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProcessedEvents1790500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "processed_events" (
        "eventId" character varying(255) PRIMARY KEY,
        "eventType" character varying(255) NOT NULL,
        "processedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "processed_events"`);
  }
}
