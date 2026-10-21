import { createCuratedShowcaseSource } from './source.js';
import { createFeedbackPanel } from './panel.js';

export async function mountDiagnosticShowcase(options) {
  const keys=['root','feedbackRoot','resolveAccess'];
  if(!options || Object.getPrototypeOf(options)!==Object.prototype ||
    Reflect.ownKeys(options).length!==keys.length || keys.some(key=>!Object.hasOwn(options,key)) ||
    typeof options.resolveAccess!=='function')throw new TypeError('Invalid diagnostics mount options.');
  const pathname=globalThis.location?.pathname;
  if(!['/gpu-demo','/gpu-demo/','/gpu-demo-viewer/showcase/','/gpu-demo-viewer/showcase/index.html'].includes(pathname)) {
    throw new TypeError('This route is not registered for diagnostics.');
  }
  let access;
  try {access=await options.resolveAccess();}catch {access=undefined;}
  const source=await createCuratedShowcaseSource({root:options.root,sceneEnabled:access?.sceneEnabled===true});
  try {
    const panel=createFeedbackPanel({root:options.feedbackRoot,source,resolveAccess:options.resolveAccess,initialAccess:access});
    return Object.freeze({refreshAccess:panel.refreshAccess,destroy(){panel.destroy();source.destroy();}});
  } catch {source.destroy();throw new Error('Diagnostics controls could not be mounted.');}
}
