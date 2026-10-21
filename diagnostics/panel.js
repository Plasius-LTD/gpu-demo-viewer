import { parseFeedbackGameDiagnostics } from '@plasius/gpu-shared/feedback-diagnostics';

const available = value => value?.featureEnabled===true && value?.capabilityGranted===true && value?.sceneEnabled===true;

// Source is private to the public mount; this internal seam permits hostile-data
// and race tests without making arbitrary registrations a supported public API.
export function createFeedbackPanel({root,source,resolveAccess,initialAccess,document=globalThis.document,
  copy=text=>globalThis.navigator.clipboard.writeText(text)}) {
  const make=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};
  const section=make('section'),heading=make('h2','Optional renderer diagnostics');
  const help=make('p','Share coarse renderer health only. No image, page content, names, locations or device identity is collected. Nothing is sent automatically.');
  const label=make('label'),consent=make('input');consent.type='checkbox';consent.checked=false;
  label.append(consent,make('span','I consent to preview and copy renderer diagnostics.'));
  const prepare=make('button','Preview diagnostics'),copyButton=make('button','Copy diagnostics');
  prepare.type=copyButton.type='button';copyButton.disabled=true;
  const previewLabel=make('label','Diagnostics preview'),preview=make('textarea');
  preview.readOnly=true;preview.value='';preview.rows=12;previewLabel.append(preview);
  const status=make('p','Diagnostics are optional. Select consent to prepare a preview.');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const style=make('style',`[data-feedback-diagnostics] {box-sizing:border-box;max-width:42rem;padding:1rem;color:#f4f7fb;background:#152234;font:1rem/1.5 system-ui;overflow-wrap:anywhere}
    [data-feedback-diagnostics] label {display:block;min-height:44px;margin:.75rem 0}
    [data-feedback-diagnostics] textarea {box-sizing:border-box;display:block;width:100%;max-width:100%;color:#f4f7fb;background:#101925;font:0.85rem/1.5 monospace}
    [data-feedback-diagnostics] input {margin-right:.5rem}
    [data-feedback-diagnostics] button {min-height:44px;margin:.25rem;padding:.5rem;color:#101925;background:#d7e7fa;border:2px solid #a3c6ed;border-radius:.25rem}
    [data-feedback-diagnostics] :focus-visible {outline:3px solid #ffce64;outline-offset:3px}
    [data-feedback-diagnostics] button:disabled {color:#526071;background:#d7e7fa}`);
  section.setAttribute('data-feedback-diagnostics','');
  section.hidden=!available(initialAccess);
  section.append(style,heading,help,label,prepare,copyButton,previewLabel,status);root.append(section);
  let revision=0,destroyed=false,text='';
  function clear(message) {
    revision++;text='';preview.value='';copyButton.disabled=true;
    if(message)status.textContent=message;
  }
  function revoke(message) {consent.checked=false;section.hidden=true;clear(message);}
  const consentChanged=()=>clear('Consent changed. Prepare a new preview before copying.');
  async function permitted(token) {
    try {
      const decision=await resolveAccess();
      if(destroyed || token!==revision || !consent.checked)return false;
      if(!available(decision)){revoke('Diagnostics are unavailable. Ordinary bug reporting remains available.');return false;}
      return true;
    } catch {
      if(!destroyed && token===revision)revoke('Diagnostics access could not be verified. Try again later.');
      return false;
    }
  }
  async function preparePreview() {
    clear();const token=revision;
    if(destroyed || !consent.checked){status.textContent='Select consent before preparing diagnostics.';return;}
    if(!await permitted(token))return;
    try {
      const packet=await source.observe(true,()=>!destroyed && token===revision && consent.checked);
      if(destroyed || token!==revision || !consent.checked)return;
      if(!packet){revoke('This surface is not eligible for diagnostics.');return;}
      text=JSON.stringify(parseFeedbackGameDiagnostics(packet),null,2);preview.value=text;
      copyButton.disabled=false;status.textContent='Preview ready. Review these exact fields before copying.';
    } catch {if(!destroyed && token===revision)revoke('Diagnostics could not be prepared safely.');}
  }
  async function copyPreview() {
    if(destroyed || !text || !consent.checked)return;
    const token=++revision;
    if(!await permitted(token))return;
    try {
      const packet=await source.observe(true,()=>!destroyed && token===revision && consent.checked);
      if(destroyed || token!==revision || !consent.checked)return;
      if(!packet || JSON.stringify(parseFeedbackGameDiagnostics(packet),null,2)!==text){
        clear('The surface changed. Prepare and review a new preview.');return;
      }
      // No await between the last consent check and invoking the explicit copy.
      await copy(text);
      if(!destroyed && token===revision)status.textContent='Diagnostics copied. Paste them only where you choose.';
    } catch {if(!destroyed && token===revision)status.textContent='Copy unavailable. Select the preview text and copy it manually.';}
  }
  consent.addEventListener('change',consentChanged);
  prepare.addEventListener('click',preparePreview);copyButton.addEventListener('click',copyPreview);
  return Object.freeze({
    async refreshAccess() {
      revoke('Access changed. Select consent and prepare a new preview.');const token=revision;
      try {
        const decision=await resolveAccess();
        if(!destroyed && token===revision)section.hidden=!available(decision);
      } catch { /* Missing remote decisions leave the controls hidden. */ }
    },
    destroy() {if(destroyed)return;destroyed=true;revoke();consent.removeEventListener('change',consentChanged);
      prepare.removeEventListener('click',preparePreview);copyButton.removeEventListener('click',copyPreview);section.remove();},
  });
}
