export function toTitleCase(str: string) {
    return str.replace(/[-_]/giu,' ').replace(
        /\w\S*/giu,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}