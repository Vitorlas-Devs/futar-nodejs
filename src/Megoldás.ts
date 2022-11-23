import fs from "fs";
import Fizetés from "./Fizetés";
import Táv from "./Táv";

export default class Megoldás {
    private _fizetések: Fizetés[];
    private _távok: Táv[];

    constructor(fizetésFájl: string, távokFájl: string) {
        this._fizetések = JSON.parse(fs.readFileSync(fizetésFájl, "utf8"));
        this._távok = JSON.parse(fs.readFileSync(távokFájl, "utf8"));
    }

    public LegelsőÚtKm(): number {
        // 1. nap and 1. sorszám

        // min of nap
        const futárElsőNapja: number = this._távok.reduce((min, táv) => (táv.nap < min ? táv.nap : min), this._távok[0].nap);

        return this._távok.find(t => t.nap === futárElsőNapja && t.sorszám === futárElsőNapja)?.megtettÚt ?? 0;
    }

    public UtolsóÚt(): number {
        const utolsóNap = Math.max(...this._távok.map(t => t.nap));
        const utolsóSorszám = Math.max(...this._távok.filter(t => t.nap === utolsóNap).map(t => t.sorszám));

        return this._távok.find(t => t.nap === utolsóNap && t.sorszám === utolsóSorszám)?.megtettÚt ?? 0;
    }

    public SzabadNapok(): number[] {
        const hétNapjai: number[] = [1, 2, 3, 4, 5, 6, 7];
        return hétNapjai.filter(nap => !this._távok.map(t => t.nap).includes(nap));
    }

    public NapALegtöbbFuvarral(): number {
        const napok: number[] = this._távok.map(t => t.nap);
        const napokSzáma: number[] = napok.map(nap => napok.filter(n => n === nap).length);

        return napok[napokSzáma.indexOf(Math.max(...napokSzáma))];
    }

    public HetiFizetés(): number {
        let szum = 0;
        for (const táv of this._távok) {
            const fizetés = this._fizetések.find(f => f.minKm <= táv.megtettÚt && f.maxKm >= táv.megtettÚt)?.összeg ?? 0;
            szum += fizetés;
        }
        return szum;
    }

    public DíjazásTávUtán(inputTáv: number): number {
        // find összeg where inputTáv is between minKm and maxKm
        const fizetés: Fizetés | undefined = this._fizetések.find(f => f.minKm <= inputTáv && f.maxKm >= inputTáv);

        return fizetés?.összeg ?? 0;
    }

    public FájlbaÍrás(fájlNév: string): string {
        // go through each day and út and write to file with the correct összeg
        const napok: number[] = this._távok.map(t => t.nap);
        const napokSzáma: number[] = napok.map(nap => napok.filter(n => n === nap).length);

        const napokSzámaMax: number = Math.max(...napokSzáma);

        let szöveg = "";
        for (let i = 0; i < napokSzámaMax; i++) {
            const nap: number = napok[i];
            const sorszám: number = i + 1;
            const táv: Táv | undefined = this._távok.find(t => t.nap === nap && t.sorszám === sorszám);
            if (táv) {
                const fizetés: Fizetés | undefined = this._fizetések.find(f => f.minKm <= táv.megtettÚt && f.maxKm >= táv.megtettÚt);
                if (fizetés) {
                    szöveg += `${nap}. nap ${sorszám}. út: ${fizetés.összeg} Ft\n`;
                }
            }
        }

        fs.writeFileSync(fájlNév, szöveg);
        return fájlNév;
    }
}
