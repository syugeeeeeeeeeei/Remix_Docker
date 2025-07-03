import { PrismaClient } from '@prisma/client';

// PrismaClientの型やEnumなどを再エクスポート
export * from '@prisma/client';

// PrismaClientのインスタンスを作成してデフォルトエクスポート
const prisma = new PrismaClient();
export default prisma;