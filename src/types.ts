export type Party =
    | 'NPP'
    | 'UDP'
    | 'INC'
    | 'VPP'
    | 'BJP'
    | 'AITC'
    | 'PDF'
    | 'HSPDP'
    | 'Vacant'
    | 'Independent'

export type District =
    | 'West Jaintia Hills district'
    | 'East Jaintia Hills district'
    | 'Ri Bhoi district'
    | 'East Khasi Hills district'
    | 'West Khasi Hills district'
    | 'Eastern West Khasi Hills district'
    | 'South West Khasi Hills district'
    | 'North Garo Hills district'
    | 'East Garo Hills district'
    | 'South Garo Hills district'
    | 'West Garo Hills district'
    | 'South West Garo Hills district'

export type ColorChoice = 'Party' | 'District'

export type Constituency = {
    "Constituency": string,
    "Constituency_No": number,
    "Name": string,
    "Party": Party,
    "District": District,
};
