module.exports = {
    openstreetmapGetPOIs: async function (
        bbox = '37.8,-122.3,37.8,-122.2',
        categories = [
            ['shop', 'supermarket'],
            ['shop', 'convenience'],
        ],
        timeout = 25_000
    ) {
        const url = 'https://overpass-api.de/api/interpreter'
        let quest = ''
        categories.forEach(([key, value]) => {
            const p = `
          node["${key}"="${value}"](${bbox});
          way["${key}"="${value}"](${bbox});
          relation["${key}"="${value}"](${bbox});`
            quest += p
        })
        const body = `
        [out:json][timeout:25];
        (
            ${quest}
        );
        out body;
        >;
        out skel qt;`
        const response = await fetch(url, { method: 'POST', body, timeout })
        const data = await response.json()
        return data.elements
            .filter((p) => p.tags)
            .map((p) => {
                p = { ...p, ...p.tags } // merge the tags object into the main one
                delete p.tags
                const type = p.members ? 'relation' : p.type
                if (!p.website && p[`contact:website`]) {
                    p.website = p[`contact:website`]
                }
                p.osm_url = `https://www.openstreetmap.org/${type}/${p.id}`
                p.osm_url_edit = `https://www.openstreetmap.org/edit?${type}=${p.id}`
                return p
            })
    },
    multiply: function (a, b) {
        return a * b
    },
}
