import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";

declare let SC: any;

@Injectable()
export class SoundcloudService {

    private _update: Subject<{}> = new Subject<{}>();
    $observable = this._update.asObservable();

    // data for soundcloud api services
    private _clientId: string = '';
    private _redirectUri: string = 'http://localhost:4200/callback.html';

    // variables to hold soundcloud data
    private _user: any;
    private _followings: any;

    constructor() {
        SC.initialize({
            client_id: this._clientId,
            redirect_uri: this._redirectUri
        });
    }

    get user(): any {
        return this._user;
    }

    get followings(): any {
        return this._followings;
    }

    set user(user: any) {
        this._user = user;
    }

    set followings(followings: any) {
        this._followings = followings;
    }

    clearData() {
        this._user = null;
        this._followings = null;
        this._update.next({ 'clear': true });
    }

    resolveUser(username: string) {
        SC.get('/resolve?url=http://soundcloud.com/' + username)
            .then((response: any) => {
                this._user = response;
                this._update.next({ resolveUser: true });
            });
    }

    getAllFollowings(username: string) {
        let collect = (userId: string) => {
            SC.get('/users/' + userId + '/followings')
                .then(response => {
                    let followings: any = [];

                    let parseResponse = (response: any) => {
                        if (response.collection.length > 0) {
                            for (let i = 0; i < response.collection.length; i++) {
                                followings.push(
                                    {
                                        id: response.collection[ i ].id,
                                        username: response.collection[ i ].username,
                                        permalink: response.collection[ i ].permalink,
                                        permalink_url: response.collection[ i ].permalink_url,
                                        avatar_url: response.collection[ i ].avatar_url
                                    });
                            }
                        }

                        if (response.next_href) {
                            SC.get(response.next_href.slice(27, response.next_href.length))
                                .then(response => {
                                    parseResponse(response);
                                }, error => {
                                    this._update.next({ followings: false, error: error });
                                });
                        }
                        else {
                            console.log(followings);
                            this._followings = followings;
                            this._update.next({ followings: true });
                        }
                    };
                    parseResponse(response);
                }, error => {
                    console.log(error);
                });
        };
        SC.get('/resolve?url=http://soundcloud.com/' + username)
            .then((response: any) => {
                this._user = {
                    id: response.id,
                    username: response.username,
                    avatar_url: response.avatar_url,
                    permalink: response.permalink,
                    permalink_url: response.permalink_url,
                    followings_count: response.followings_count
                };
                this._update.next({ resolveUser: true });
                collect(response.id);
            }, error => {
                console.log(error);
            });
    }
}

