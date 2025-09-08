export function useDebounce<T extends (...args:any[])=>any>(fn:T, ms=350){
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
