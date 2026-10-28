import { createFeedbackPanel } from './panel.js';

// Private coordinator. Hosts cannot inject a source through the public mount.
export async function mountFeedbackLifecycle({root,feedbackRoot,resolveAccess,createSource}) {
  const readAccess=async()=>{try {return await resolveAccess();}catch {return undefined;}};
  const initialAccess=await readAccess();
  let sourceMounted=initialAccess?.sceneEnabled===true;
  const source=await createSource({root,sceneEnabled:sourceMounted});
  const currentAccess=async()=>{
    const decision=await readAccess();
    // A scene denial ends this source lifetime. Recovery requires a fresh mount;
    // never silently reload assets or retain a renderer after scene revocation.
    if(decision?.sceneEnabled!==true){sourceMounted=false;source.destroy();}
    return decision;
  };
  try {
    const access=await currentAccess();
    const panel=createFeedbackPanel({root:feedbackRoot,source,resolveAccess:currentAccess,
      initialAccess:access,isSourceMounted:()=>sourceMounted});
    return Object.freeze({refreshAccess:panel.refreshAccess,destroy(){panel.destroy();source.destroy();}});
  } catch {source.destroy();throw new Error('Diagnostics controls could not be mounted.');}
}
