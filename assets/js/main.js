var app = new Vue({
    el: '#app',
    data: function () {
        return {
            certs: [],
            gist: 'https://gist.githubusercontent.com/fengkx/55678154ff2fc462f6de8a872eb75ac1/raw/cert_status.json'
        }
    },
    async created() {
        let resp;
        try {
            resp = await fetch(this.gist);
            if(!resp.ok) throw resp;
            const certs = await resp.json();
            this.certs = certs;
        } catch (e) {
            let msg = 'GitHub Gist may be blocked in Mainland China!\n';
            if(e.status && e.statusText) {
                alert(`${msg} Network error to ${this.gist} ${e.status} ${e.statusText}`);
            } else {
                alert(msg + e);
            }
        }
    },
    methods: {
        objectToKVStr: function(object) {
            return Object.keys(object).reduce((acc, cur) => {
                acc += `${cur}=${object[cur]};` + ' ';
                return acc
            }, '');
        }
    },
    computed: {
        cCerts: function() {
            const now = Date.now();
            return this.certs.map(cert => {
                const result = {...cert};
                result.last_check = (new Date(cert.last_check)).toLocaleString();
                result.site = new URL(result.site).host;
                if(result.issuer) {
                    result.issuer = this.objectToKVStr(result.issuer);
                }
                if(result.subject) {
                    result.subject = this.objectToKVStr(result.subject);
                }
                result.expired = result.valid_to < now || result.valid_from > now;
                if(!result.expired) {
                    result.remain = Math.floor((new Date(result.valid_to) - now) / 1000 / (3600*24))
                }
                return result
            })
        }
    }
});
