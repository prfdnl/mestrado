// globalThis userdata
declare var userdata: { name:string, id: number, roles?: string[] } | null;

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.html' {
  const content: string;
  export default content;
}