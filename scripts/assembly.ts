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

type ProcessedData = {
    currentDistrict: string,
    rows: Row[]
}

const res = await fetch('https://www.wikitable2json.com/api/11th_Meghalaya_Assembly?table=2&keyRows=1')
const tables = await res.json() as [RawRow[]]
const data = tables[0].reduce<ProcessedData>((processedData, row) => {
    const { rows, currentDistrict } = processedData;
    if (isDistrictRow(row)) {
        return { ...processedData, currentDistrict: getDistrict(row) }
    }
    return { ...processedData, rows: [...rows, { ...row, District: currentDistrict, Constituency_No: parseInt(row['No.']) }] }
}, { currentDistrict: '', rows: [] })

// verifyDistricts(data.rows)
console.log(JSON.stringify(data.rows, null, 2))

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
