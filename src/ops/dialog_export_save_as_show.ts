import { dialog } from 'electron';

export default async function dialog_export_save_as_show(
  title: string,
  name: string,
  extensions: string[]
): Promise<{
  file_path: string | undefined;
  canceled: boolean;
}> {
  // Electron filter extensions must not contain a leading dot; on Windows a
  // dotted extension (e.g. '.zip') produces filenames like 'name..zip'.
  // See https://github.com/Lumieducation/Lumi/issues/2686
  const cleanExtensions = extensions.map((e) => e.replace(/^\.+/, ''));

  const result = await dialog.showSaveDialog({
    title,
    filters: [{ name, extensions: cleanExtensions }],
    properties: ['showOverwriteConfirmation']
  });

  let filePath = result.filePath;
  if (filePath) {
    // Defensively collapse a double extension ('name..zip' -> 'name.zip')
    // that older/broken dialogs may still produce.
    for (const ext of cleanExtensions) {
      const doubled = `..${ext}`;
      if (filePath.toLowerCase().endsWith(doubled.toLowerCase())) {
        filePath = `${filePath.slice(0, -doubled.length)}.${ext}`;
        break;
      }
    }
  }

  return {
    file_path: filePath,
    canceled: result.canceled
  };
}
