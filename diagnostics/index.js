import { createCuratedShowcaseSource } from './source.js';
import { mountFeedbackLifecycle } from './lifecycle.js';

export async function mountDiagnosticShowcase(options) {
  const keys=['root','feedbackRoot','resolveAccess'];
  if(!options || Object.getPrototypeOf(options)!==Object.prototype ||
    Reflect.ownKeys(options).length!==keys.length || keys.some(key=>!Object.hasOwn(options,key)) ||
    typeof options.resolveAccess!=='function')throw new TypeError('Invalid diagnostics mount options.');
  const pathname=globalThis.location?.pathname;
  if(!['/gpu-demo','/gpu-demo/','/gpu-demo-viewer/showcase/','/gpu-demo-viewer/showcase/index.html'].includes(pathname)) {
    throw new TypeError('This route is not registered for diagnostics.');
  }
  return mountFeedbackLifecycle({...options,createSource:createCuratedShowcaseSource});
}
