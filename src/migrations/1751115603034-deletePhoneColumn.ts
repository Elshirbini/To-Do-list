import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeletePhoneColumn1751115603034 implements MigrationInterface {
  name = 'DeletePhoneColumn1751115603034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phone\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`phone\` varchar(255) NULL`,
    );
  }
}
