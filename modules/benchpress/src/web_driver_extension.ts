import {bind, provide, Provider, Injector, OpaqueToken} from 'angular2/src/core/di';

import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';

import {Options} from './common_options';

/**
 * A WebDriverExtension implements extended commands of the webdriver protocol
 * for a given browser, independent of the WebDriverAdapter.
 * Needs one implementation for every supported Browser.
 */
export abstract class WebDriverExtension {
  static bindTo(childTokens: any[]): Provider[] {
    var res = [
      bind(_CHILDREN).toFactory(
          (injector: Injector) => childTokens.map(token => injector.get(token)), [Injector]),
      bind(WebDriverExtension)
          .toFactory(
              (children: WebDriverExtension[], capabilities) => {
                var delegate;
                children.forEach(extension => {
                  if (extension.supports(capabilities)) {
                    delegate = extension;
                  }
                });
                if (isBlank(delegate)) {
                  throw new BaseException('Could not find a delegate for given capabilities!');
                }
                return delegate;
              },
              [_CHILDREN, Options.CAPABILITIES])
    ];
    return res;
  }

  gc(): Promise<any> { throw new BaseException('NYI'); }

  timeBegin(name: string): Promise<any> { throw new BaseException('NYI'); }

  timeEnd(name: string, restartName: string): Promise<any> { throw new BaseException('NYI'); }

  /**
   * Format:
   * - cat: category of the event
   * - name: event name: 'script', 'gc', 'render', ...
   * - ph: phase: 'B' (begin), 'E' (end), 'b' (nestable start), 'e' (nestable end), 'X' (Complete
   *event)
   * - ts: timestamp in ms, e.g. 12345
   * - pid: process id
   * - args: arguments, e.g. {heapSize: 1234}
   *
   * Based on [Chrome Trace Event
   *Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)
   **/
  readPerfLog(): Promise<any[]> { throw new BaseException('NYI'); }

  perfLogFeatures(): PerfLogFeatures { throw new BaseException('NYI'); }

  supports(capabilities: {[key: string]: any}): boolean { return true; }
}

export class PerfLogFeatures {
  render: boolean;
  gc: boolean;
  frameCapture: boolean;
  userTiming: boolean;

  constructor(
      {render = false, gc = false, frameCapture = false, userTiming = false}:
          {render?: boolean, gc?: boolean, frameCapture?: boolean, userTiming?: boolean} = {}) {
    this.render = render;
    this.gc = gc;
    this.frameCapture = frameCapture;
    this.userTiming = userTiming;
  }
}

var _CHILDREN = new OpaqueToken('WebDriverExtension.children');
