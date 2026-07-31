declare module "*.html" {
  const content: string;
  export default content;
}

declare module "*.css" {
  const content: string;
  export default content;
}

// globalThis user
declare var user: {
  token: string;
  id: string;
  username: string;
  roles: string[];
}