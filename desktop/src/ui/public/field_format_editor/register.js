import { RegistryFieldFormatEditorsProvider } from 'ui/registry/field_format_editors';
import { bytesEditor } from 'ui/field_format_editor/editors/numeral/bytes';
import { colorEditor } from 'ui/field_format_editor/editors/color/color';
import { dateEditor } from 'ui/field_format_editor/editors/date/date';
import { durationEditor } from 'ui/field_format_editor/editors/duration/duration';
import { numberEditor } from 'ui/field_format_editor/editors/numeral/number';
import { percentEditor } from 'ui/field_format_editor/editors/percent/percent';
import { stringEditor } from 'ui/field_format_editor/editors/string/string';
import { truncateEditor } from 'ui/field_format_editor/editors/truncate/truncate';
import { urlEditor } from 'ui/field_format_editor/editors/url/url';
import { bitsEditor } from 'ui/field_format_editor/editors/bits/bits';
import { timeEditor } from 'ui/field_format_editor/editors/time/time';
RegistryFieldFormatEditorsProvider.register(bytesEditor);
RegistryFieldFormatEditorsProvider.register(colorEditor);
RegistryFieldFormatEditorsProvider.register(dateEditor);
RegistryFieldFormatEditorsProvider.register(durationEditor);
RegistryFieldFormatEditorsProvider.register(numberEditor);
RegistryFieldFormatEditorsProvider.register(percentEditor);
RegistryFieldFormatEditorsProvider.register(stringEditor);
RegistryFieldFormatEditorsProvider.register(truncateEditor);
RegistryFieldFormatEditorsProvider.register(urlEditor);
RegistryFieldFormatEditorsProvider.register(bitsEditor);
RegistryFieldFormatEditorsProvider.register(timeEditor);
