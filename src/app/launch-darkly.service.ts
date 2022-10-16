import { Injectable } from '@angular/core';
import { initialize, LDClient, LDFlagSet, LDOptions, LDUser } from 'launchdarkly-js-client-sdk';
import { Observable } from 'rxjs';
import { ReplaySubject } from 'rxjs';

export interface LDFlagInfo {
  loading: boolean;
  flags: LDFlagSet;
}

@Injectable({
  providedIn: 'root'
})
export class LaunchDarklyService {

  public flags!: Observable<LDFlagInfo>;
  private ldClient!: LDClient;
  private dataStore!: LDFlagInfo;
  private _flags!: ReplaySubject<LDFlagInfo>;
  private user!: LDUser;
  public readonly waitUntilSetupComplete: Promise<boolean>;
  private MAX_LD_RETRIES = 2;

  constructor() {
      this.waitUntilSetupComplete = new Promise((resolver, _) => {
          this.dataStore = { loading: true, flags: <LDFlagSet>{} };
          this._flags = <ReplaySubject<LDFlagInfo>>new ReplaySubject();
          this._flags.next(Object.assign({}, this.dataStore));
          this.flags = this._flags.asObservable();
          this.user = <LDUser>{
              key: `anon`,
              name: 'Anonymous',
              anonymous: true
          };
          try {
              const options = <LDOptions>{
                  evaluationReasons: true
              };
              this.ldClient = initialize('5d5eb81fb0cff40872f00da1', this.user, options);
              this.ldClient.on('ready', () => {
                  this.dataStore.loading = false;
                  this.dataStore.flags = this.ldClient.allFlags();
                  this._flags.next(Object.assign({}, this.dataStore));
              });

              this.ldClient.on('change', (settings) => {
                  console.log(settings);
                  this.dataStore.flags = this.ldClient.allFlags();
                  this._flags.next(Object.assign({}, this.dataStore));
              });
          } catch (error) {
          }
          this.ldClient.waitForInitialization().then(() => {
              resolver(true);
          }).catch((error) => {
              const errorObj = {
                  error,
                  user: this.user
              };
              resolver(false);
          });
      });
  }
}
