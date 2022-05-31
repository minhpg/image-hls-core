const axios = require('axios')
const uuid = require('uuid')


class BunnyLibraryError extends Error {
    constructor({type, title, status, errors}) {
        super(`${status} - ${title} - ${JSON.stringify(errors)}`)
        this.type = type
        this.title = title
        this.status = status
        this.errors = errors
    }
}
class BunnyLibrary {

    apiPrefix = 'http://api.bunny.net/'

    constructor (accessKey) {
        this.accessKey = accessKey
        this.request = axios.create({
            headers: {
                accept : 'application/json',
                AccessKey: accessKey,
            }
        })
    }

    async fetch (url, method, body) {
        try{
            const response = await this.request({
                url,
                method,
                body,
            })
            console.log(response.data)
            return response.data
        }
        catch({response}) {
            console.log(response.data)
            throw new BunnyLibraryError(response.data)
        }
    }

    listLibraries () {
        const url = `${this.apiPrefix}videolibrary`
        const method = 'GET'
        return this.fetch(url, method)
    }

    createLibrary (ReplicationRegions=[4]) {
        const url = `${this.apiPrefix}videolibrary`
        const method = 'POST'
        const body = {
            Name: uuid.v4(),
            ReplicationRegions
        }
        return this.fetch(url, method, body)
    }
}

// const client = new BunnyLibrary(
//     '9bf5fea1-2745-4800-be4c-ff262b472caaf133e4ea-9dbf-4cca-91e4-309619decf8a'
// )

// client.listLibraries()
module.exports = BunnyLibrary