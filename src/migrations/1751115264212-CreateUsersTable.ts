import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1751115264212 implements MigrationInterface {
  name = 'CreateUsersTable1751115264212';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tasks\` (\`task_id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`title\` varchar(200) NOT NULL, \`description\` varchar(400) NOT NULL, \`tags\` text NOT NULL, \`isPinned\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_db55af84c226af9dce09487b61\` (\`user_id\`), PRIMARY KEY (\`task_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`user_id\` varchar(36) NOT NULL, \`fullName\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`role\` enum ('admin', 'user') NOT NULL DEFAULT 'user', \`codeValidation\` varchar(255) NULL, \`codeValidationExpire\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tasks\` ADD CONSTRAINT \`FK_db55af84c226af9dce09487b61b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tasks\` DROP FOREIGN KEY \`FK_db55af84c226af9dce09487b61b\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_db55af84c226af9dce09487b61\` ON \`tasks\``,
    );
    await queryRunner.query(`DROP TABLE \`tasks\``);
  }
}
