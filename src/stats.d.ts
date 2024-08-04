declare module 'stats.js' {
    export default class Stats {
        constructor();
        showPanel(panel: number): void;
        begin(): void;
        end(): void;
        update(): void;
        dom: HTMLDivElement;
    }
}
