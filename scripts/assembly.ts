import _ from "https://cdn.skypack.dev/lodash?dts"

type RawRow = {
    "No.": string,
    "Constituency": string,
    "Name": string,
    "Party": string,
    "Alliance": string,
    "Remarks": string,
}

type Row = RawRow & {
    District: string,
    Constituency_No: number,
}

type ReducedData = {
    currentDistrict: string,
    rows: Row[]
}

const res = await fetch('https://www.wikitable2json.com/api/11th_Meghalaya_Assembly?table=2&keyRows=1')
const tables = await res.json() as [RawRow[]]
const data = tables[0].reduce<ReducedData>((reducedData, row) => {
    const { rows, currentDistrict } = reducedData;
    if (isDistrictRow(row)) {
        return { ...reducedData, currentDistrict: getDistrict(row) }
    }
    return { ...reducedData, rows: [...rows, { ...row, District: currentDistrict, Constituency_No: parseInt(row['No.']) }] }
}, { currentDistrict: '', rows: [] })

const result = {
    constituencies: data.rows,
    districts: _.uniqBy(data.rows, 'District').map(({ District }) => District),
    parties: _.uniqBy(data.rows, 'Party').map(({ Party }) => Party),
}

console.log(JSON.stringify(result, null, 2))

function isDistrictRow(row: RawRow) {
    const { "No.": no,  Constituency, Name, Party, Alliance, Remarks } = row
    return no === Constituency && Constituency === Name && Name === Party && Party === Alliance && Alliance === Remarks;
}

function getDistrict(row: RawRow) {
    return row["No."];
}

function verifyDistricts(rows: Row[]) {
    console.log(rows.map(({ District, Constituency, Party }) => [District, Constituency, Party ]))
}
