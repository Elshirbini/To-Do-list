import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageKeyAndUrl1752327684445 implements MigrationInterface {
    name = 'AddImageKeyAndUrl1752327684445'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`imageKey\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`imageUrl\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`imageUrl\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`imageKey\``);
    }

}
