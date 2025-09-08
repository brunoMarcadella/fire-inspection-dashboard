<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- HEADER -->
    <header class="bg-navy-900/95 backdrop-blur border-b border-navy-800">
      <div class="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-full ring-2 ring-teal-400 flex items-center justify-center">
            <span class="text-teal-400 font-bold text-xl">✓</span>
          </div>
          <div class="leading-tight">
            <h1 class="text-xl font-semibold tracking-wide">SURVEY <span class="text-teal-400">4.0</span></h1>
            <p class="text-xs text-slate-300/70 -mt-0.5">Inspeção Total</p>
          </div>
        </div>
        <nav class="hidden md:flex items-center gap-6 text-slate-300">
          <a class="hover:text-white" href="#">Home</a>
          <a class="hover:text-white" href="#">Sobre nós</a>
          <a class="hover:text-white" href="#">Survey 4.0</a>
          <a class="hover:text-white" href="#">Contato</a>
        </nav>
      </div>
    </header>

    <!-- MAIN -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- FOOTER -->
    <footer class="bg-navy-900 border-t border-navy-800">
      <div class="mx-auto max-w-7xl px-4 py-8 text-center text-slate-300">
        <div class="text-sm">Sistemas e soluções para facilitar o dia a dia das empresas.</div>
        <div class="text-xs text-slate-300/70 mt-2">© 2025 SURVEY 4.0 • Feito com ♥</div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
</style>
