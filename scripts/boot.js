// scripts/boot.js
const { execSync } = await import('node:child_process');

if (!process.env.DATABASE_URL) {
    console.error("[BOOT] Falta DATABASE_URL en runtime. Añádela en Variables del SERVICIO.");
    process.exit(1);
}

// Muchos Postgres gestionados requieren SSL
if (!/sslmode=/.test(process.env.DATABASE_URL)) {
    process.env.DATABASE_URL += (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=require';
}

console.log("[BOOT] DATABASE_URL detectada. Ejecutando prisma db push...");
try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log("[BOOT] Prisma db push OK. Arrancando servidor…");
} catch (e) {
    console.error("[BOOT] prisma db push falló:", e?.message || e);
    process.exit(1);
}

// Arranca el servidor compilado
await import('../dist/server.js');
