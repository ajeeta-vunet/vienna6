import { ChartOptions } from 'chart.js';
import moment from 'moment';

export const ChartOption: ChartOptions = {

  scales: {
    xAxes: [
      {
        offset: true,
        type: 'time',
        distribution: 'series',
        time:{
          parser:  (utcMoment) => moment(utcMoment).utcOffset('+0530')
        },
        ticks: {
            source: 'auto',
            autoSkip: true,
            maxTicksLimit: 10,
            major:{autoSkip: true,
            source: 'auto',
          maxTicksLimit:8}
        },
        display: true,  
        gridLines: {
          color: 'rgba(0, 0, 0, 0)',
          zeroLineColor: 'rgba(0, 0, 0, 0.0)',
        },
        scaleLabel: {
          display: false,
          labelString: 'Time',
        },
      },
    ],
    yAxes: [
      {
        type: 'linear',
        display: true,
        position: 'left',
        gridLines: {
          color: 'rgba(0, 0, 0, 0.1)',
          borderDash: [4, 4],
          zeroLineColor: 'rgba(0, 0, 0, 0.0)',
          drawBorder: false,
        },

        scaleLabel: {
          display: true,
          labelString: 'Count',
        },
      },
    ],
  },
  legend: {
    display: false,
  },

  responsive: true,
};
