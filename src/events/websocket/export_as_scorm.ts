import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import window_backdrop_hide from '../../ops/window_backdrop_hide';
import window_snackbar_show from '../../ops/window_snackbar_show';
import window_backdrop_show from '../../ops/window_backdrop_show';
import content_export_as_scorm from '../../ops/content_export_as_scorm';
import dialog_export_save_as_show from '../../ops/dialog_export_save_as_show';

export default function event_websocket_export_as_scorm(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('export_as_scorm', async (payload) => {
    context.log.info('events:websocket:export_as_scorm', payload);
    const { contentId, options } = payload;

    const { file_path } = await dialog_export_save_as_show(
      context.translate('Export as SCORM'),
      '.zip',
      ['zip']
    );

    if (!file_path) {
      return;
    }

    await window_backdrop_show(context, contentId);

    try {
      await content_export_as_scorm(context, contentId, file_path, options);

      await window_snackbar_show(
        context,
        contentId,
        context.translate(`Content exported to {{file_path}}`, { file_path }),
        'success'
      );
    } catch (error: any) {
      context.log.error('events:websocket:export_as_scorm failed', {
        message: error?.message,
        stack: error?.stack
      });
      await window_snackbar_show(
        context,
        contentId,
        context.translate(`Export failed: {{error}}`, {
          error: error?.message || 'unknown error'
        }),
        'error'
      );
    } finally {
      await window_backdrop_hide(context, contentId);
    }
  });
}
