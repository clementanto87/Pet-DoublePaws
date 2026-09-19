import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLegacyBankDetails1770000000000 implements MigrationInterface {
    name = 'RemoveLegacyBankDetails1770000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "sitter_profiles" DROP COLUMN IF EXISTS "bankDetails"');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Raw bank details must never be restored to the schema.
    }
}
