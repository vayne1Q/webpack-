import $ from 'jquery';
import _ from 'lodash';
import {ui} from './jquery.ui';

ui();
const dom = $('div');
dom.html(_.join(['dell', 'lee'], '---'));
$('body').append(dom);