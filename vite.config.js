import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function listFiles(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? listFiles(full, base) : [relative(base, full)]
  })
}

/**
 * Carimba no service worker o hash e a lista do que foi publicado.
 *
 * O nome do cache precisa mudar quando o conteudo muda - senao o navegador
 * serve a versao antiga para sempre. E precisa NAO mudar quando nada mudou,
 * para um redeploy nao jogar fora o cache de todo mundo. Por isso o hash e do
 * conteudo, nao da data do build.
 *
 * A lista de arquivos entra junto porque os nomes de JS e CSS carregam hash e
 * so existem depois do build - sem ela o precache ficaria incompleto.
 */
function stampServiceWorker() {
  return {
    name: 'pibwallet-stamp-sw',
    apply: 'build',
    closeBundle() {
      const outDir = 'dist'
      const swPath = join(outDir, 'sw.js')
      const hash = createHash('sha256')
      for (const file of listFiles(outDir).sort()) {
        if (file === 'sw.js') continue
        hash.update(file)
        hash.update(readFileSync(join(outDir, file)))
      }
      const version = hash.digest('hex').slice(0, 12)
      const assets = listFiles(outDir)
        .filter((file) => file !== 'sw.js' && file !== 'index.html')
        .map((file) => '/' + file.split(sep).join('/'))
        .sort()

      const source = readFileSync(swPath, 'utf8')
        .replaceAll('__BUILD_VERSION__', version)
        .replaceAll('__BUILD_ASSETS__', JSON.stringify(assets))
      writeFileSync(swPath, source)
      this.info?.(`service worker: pibwallet-${version}, ${assets.length} arquivos no precache`)
    }
  }
}

export default defineConfig({
  plugins: [react(), stampServiceWorker()],
  server: { port: 5173 },
  build: { outDir: 'dist' }
})
