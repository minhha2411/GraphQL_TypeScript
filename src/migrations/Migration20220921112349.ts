import { Migration } from '@mikro-orm/migrations';

export class Migration20220921112349 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" rename column "password" to "pass_word";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" rename column "pass_word" to "password";');
  }

}
