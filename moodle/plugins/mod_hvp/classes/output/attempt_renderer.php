<?php

namespace mod_solo\output;

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.


defined('MOODLE_INTERNAL') || die();

use \mod_solo\constants;
use \mod_solo\utils;
use \mod_solo\diff;
use \mod_solo\textanalyser;

/**
 * A custom renderer class that extends the plugin_renderer_base.
 *
 * @package mod_solo
 * @copyright COPYRIGHTNOTICE
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class attempt_renderer extends \plugin_renderer_base {

    /**
     * Show the introduction text is as set in the activity description
     */
    public function show_intro($readaloud, $cm) {
        $ret = "";
        if (trim(strip_tags($readaloud->intro))) {
            $ret .= $this->output->box_start(constants::M_INTRO_CONTAINER . ' ' . constants::M_CLASS . '_center ');
            $ret .= format_module_intro('readaloud', $readaloud, $cm->id);
            $ret .= $this->output->box_end();
        }
        return $ret;
    }

 /**
 * Return HTML to display add first page links
 * @param lesson $lesson
 * @return string
 */
 public function add_edit_page_links($solo, $latestattempt, $thisstep, $cm, $context) {
		global $CFG;

     //instructions /intro
        $output = '';
        $introcontent = $this->show_intro($solo, $cm);

        $parts = array();
        $buttonclass = 'btn ' . constants::M_COMPONENT .'_menubutton ' . constants::M_COMPONENT;

        //Set the attempt id
        $attemptid = 0;
        //TODO reverted to non form processing, so id should be id, not like it says below. Confirm its working right
        //because of the way attemot/data are managed in form handler (manageattempts.php) the true attemptid is at 'attemptid' not 'id'
        if($latestattempt){$attemptid = $latestattempt->id;}

      //stepdata
     $stepdata=new \stdClass();
     //get total steps
     $stepdata->totalsteps = 1;//we always have a prepare step (and a finished step but we dont count that)
     $steps = [2,3,4,5];
     foreach($steps as $step) {
         if ($solo->{'step' . $step} != constants::M_STEP_NONE) {
             $stepdata->totalsteps++;
         }
     }


     $stepdata->completedsteps =(($latestattempt && $latestattempt->completedsteps) ?  $latestattempt->completedsteps : 0);
     $stepdata->currentstep =  1 + $stepdata->completedsteps;
     //this is not exactly "percentagecomplete", it actually is the number of lines between steps, eg 1 -- 2 -- 3 -- 4
     $stepdata->percentcomplete= $stepdata->completedsteps ==0  ? 0 : round(($stepdata->completedsteps  +1 / ($stepdata->totalsteps)) * 100,0);
     if($stepdata->percentcomplete > 100){$stepdata->percentcomplete = 100;}


        //init buttons
     $buttons = [];
     $steps = [1,2,3,4];
     foreach($steps as $step) {
        $button = new \stdClass();
        if($step <= $stepdata->currentstep ) {
            $button->class = 'activeordone';
        }else{
            $button->class = '';
        }
         $buttons[] =$button;
     }

         return $this->output->render_from_template( constants::M_COMPONENT . '/activityintrobuttons', ['introcontent'=>$introcontent,'stepdata'=>$stepdata, 'buttons'=>$buttons]);
    }

    function show_userattemptsummary($moduleinstance,$attempt,$aidata, $stats){
        $userheader=true;
        return $this->show_summary($moduleinstance,$attempt,$aidata, $stats,$userheader);
    }

    public function show_placeholdereval($attemptid){
        $data = new \stdClass();
        $data->attemptid = $attemptid;
        return $this->output->render_from_template( constants::M_COMPONENT . '/summaryplaceholdereval', $data);
    }

    function show_teachereval($rubricresults, $feedback, $evaluator){
        $data = new \stdClass();
        $data->rubricresults = $rubricresults;
        $data->feedback=$feedback;
        $data->evaluator=$evaluator;
        return $this->output->render_from_template( constants::M_COMPONENT . '/summaryteachereval', $data);
    }

    function show_spellingerrors($spellingerrors){
        $data = new \stdClass();
        if(count($spellingerrors)) {
            $data->spellingerrors = $spellingerrors;
            $data->spellingerrorslabel = get_string('possiblespellingerrors',constants::M_COMPONENT);
        }else{
            $data->spellingerrorslabel = get_string('nospellingerrors',constants::M_COMPONENT);
        }
        return $this->output->render_from_template( constants::M_COMPONENT . '/summaryspellingeval', $data);
    }
    function show_grammarerrors($grammarerrors){
        $data = new \stdClass();
        if(count($grammarerrors)) {
            $data->grammarerrors = $grammarerrors;
            $data->grammarerrorslabel = get_string('possiblegrammarerrors',constants::M_COMPONENT);
        }else{
            $data->grammarerrorslabel = get_string('nogrammarerrors',constants::M_COMPONENT);
        }
        return $this->output->render_from_template( constants::M_COMPONENT . '/summarygrammareval', $data);
    }

    function show_summary($moduleinstance,$attempt,$aidata, $stats,$userheader=false){
        $attempt->targetwords = utils::fetch_targetwords($attempt->topictargetwords);
        $attempt->convlength = $moduleinstance->convlength;
        $attempt->speakingtopic = $moduleinstance->speakingtopic;
        //$attempt->selftranscriptparts = utils::fetch_selftranscript_parts($attempt);

        if($userheader){
            $ret = $this->output->render_from_template( constants::M_COMPONENT . '/summaryuserattemptheader', $attempt);
        }else{
            $ret = $this->output->render_from_template( constants::M_COMPONENT . '/summaryheader', $attempt);
        }

        $ret .= $this->output->render_from_template( constants::M_COMPONENT . '/summarychoices', $attempt);

        return $ret;
    }

    function show_summarypassageandstats($attempt,$aidata,$stats,$autotranscriptready, $selftranscribe){
        //mark up our passage for review
        //if we have ai we need all the js and markup, otherwise we just need the formated transcript
        $ret='';
        //spelling and grammar data
        $tdata=array('a'=>$attempt, 's'=>$stats, 'audiofilename'=>$attempt->filename, 'autotranscriptready'=>$autotranscriptready);
        $tdata['spellingerrors'] = textanalyser::fetch_spellingerrors($stats,$attempt->selftranscript);
        $tdata['grammarerrors'] = textanalyser::fetch_grammarerrors($stats,$attempt->selftranscript);
        if($tdata['spellingerrors']){$tdata['hasspellingerrors']=true;}
        if($tdata['grammarerrors']){$tdata['hasgrammarerrors']=true;}
        if($selftranscribe){$tdata['selftranscribe']=true; }

        //if you have no transcript then it will error on render, so we use a space by default
        //it should never really be blank however, and theuser arrived in a strange way probbaly. This just avoids an ugly error
        $simpleselftranscript=' ';
        if(!empty($attempt->selftranscript)){
            $simpleselftranscript=$attempt->selftranscript;
        }

        if($aidata) {

            $markedpassage = \mod_solo\aitranscriptutils::render_passage($simpleselftranscript);
            $js_opts_html = \mod_solo\aitranscriptutils::prepare_passage_amd($attempt, $aidata);
            $markedpassage .= $js_opts_html;

            //add nav to marrked Passage
            /*
            $navdata=[];
            $navdata['clarity_errors']=$aidata->errorcount ? '(' .$aidata->errorcount. ')':'';;
            $navdata['spelling_errors']=$tdata['spellingerrors'] ? '(' .count($tdata['spellingerrors']). ')':'';
            $navdata['grammar_errors']=$tdata['grammarerrors'] ? '(' .count($tdata['grammarerrors']). ')':'';
            $resultsnav = $this->output->render_from_template( constants::M_COMPONENT . '/summarytranscriptnav', $navdata);
            $markedpassage = $resultsnav . $markedpassage;
            */
        }else{
            $markedpassage = $this->output->render_from_template( constants::M_COMPONENT . '/summarytranscript', $tdata);
        }
        $tdata['markedpassage']=$markedpassage;

        //if we have a correction, send that out too
        if(!empty($attempt->grammarcorrection)){
            /*
            list($grammarerrors,$grammarmatches,$insertioncount) = utils::fetch_grammar_correction_diff($simpleselftranscript, $attempt->grammarcorrection);
            $js_opts_html = \mod_solo\aitranscriptutils::prepare_corrections_amd($grammarerrors,$grammarmatches);
            $markedupcorrections = \mod_solo\aitranscriptutils::render_passage($attempt->grammarcorrection,'corrections');
            $markedupcorrections .= $js_opts_html;
            $tdata['grammarcorrection']=$markedupcorrections;
*/


                if(diff::cleanText($simpleselftranscript)==diff::cleanText($attempt->grammarcorrection)) {
                    $tdata['grammarcorrection'] = get_string('no_grammar_corrections', constants::M_COMPONENT);
                }else{
                    $differer = new \mod_solo\FineDiff($simpleselftranscript, $attempt->grammarcorrection, \mod_solo\FineDiff::$wordGranularity);
                    $diff_html = $differer->renderDiffToHTML();
                    $toggle_diff = $this->output->render_from_template( constants::M_COMPONENT . '/summary_togglecorrections', []);
                    $tdata['grammarcorrection']= $diff_html . $toggle_diff;
                }

        }

        //send data to template
        $ret .= $this->output->render_from_template( constants::M_COMPONENT . '/summaryresults', $tdata);
        return $ret;
    }


    function show_myreports($moduleinstance,$cm){

        $myprogress = new \single_button(
                new \moodle_url(constants::M_URL . '/myreports.php',
                        array('report' => 'myprogress', 'id' => $cm->id, 'n' => $moduleinstance->id,'format'=>'linechart')),
                get_string('myprogressreport', constants::M_COMPONENT), 'get');
        $buttons[] = $this->render($myprogress);

        $myattempts = new \single_button(
                new \moodle_url(constants::M_URL . '/myreports.php',
                        array('report' => 'myattempts', 'id' => $cm->id, 'n' => $moduleinstance->id,'format'=>'tabular')),
                get_string('myattempts', constants::M_COMPONENT), 'get');
        $buttons[] = $this->render($myattempts);



        $buttonshtml = \html_writer::div(  implode("&nbsp;&nbsp;",$buttons),  constants::M_CLASS . '_listbuttons');
        $data = new \stdClass();
        $data->reportbuttons = $buttonshtml;
        return $this->output->render_from_template( constants::M_COMPONENT . '/summarymyreports', $data);
    }

	/**
	 * Return the html table of attempts
	 * @param array homework objects
	 * @param integer $courseid
	 * @return string html of table
	 */
	function show_attempts_list($attempts,$tableid,$cm){
	    global $DB;


		if(!$attempts){
			return $this->output->heading(get_string('noattempts',constants::M_COMPONENT), 3, 'main');
		}

		$table = new \html_table();
		$table->id = $tableid;


		$table->head = array(
            get_string('timemodified', constants::M_COMPONENT),
            get_string('users', constants::M_COMPONENT),
			get_string('actions', constants::M_COMPONENT),
            ''
		);
		$table->headspan = array(1,1,1);
		$table->colclasses = array(
                'timemodified', 'actions','actions'
		);

		//loop through the attempts and add to table
        $currentattempt=0;
		foreach ($attempts as $attempt) {
            $currentattempt++;
            $row = new \html_table_row();

            //modify date
            $datecell_content = date("Y-m-d H:i:s",$attempt->timemodified);
            $attemptdatecell = new \html_table_cell($datecell_content);


            //attempt edit
            $actionurl = constants::M_URL . '/attempt/manageattempts.php';

            //attempt part (stages) links
            $parts = array();

            $itemtitle = get_string('attempt_partone', constants::M_COMPONENT);
            if($attempt->completedsteps >= constants::STEP_NONE) {
                $editurl = new \moodle_url($actionurl,
                        array('id' => $cm->id, 'attemptid' => $attempt->id, 'type' => constants::STEP_PREPARE));
                $edituserselections = \html_writer::link($editurl, $itemtitle);
                $parts[] = $edituserselections;
            }else{
                $parts[] = $itemtitle;
            }

            $itemtitle = get_string('attempt_parttwo', constants::M_COMPONENT);
            if($attempt->completedsteps >= constants::STEP_PREPARE) {
                $editurl = new \moodle_url($actionurl,
                        array('id' => $cm->id, 'attemptid' => $attempt->id, 'type' => constants::STEP_MEDIARECORDING));
                $editaudio = \html_writer::link($editurl,$itemtitle);
                $parts[] = $editaudio;
            }else{
                $parts[] = $itemtitle;
            }

            $itemtitle = get_string('attempt_partthree', constants::M_COMPONENT);
            if($attempt->completedsteps >= constants::STEP_MEDIARECORDING) {
                    $editurl = new \moodle_url($actionurl,
                            array('id' => $cm->id, 'attemptid' => $attempt->id, 'type' => constants::STEP_SELFTRANSCRIBE));
                    $edittranscript = \html_writer::link($editurl, $itemtitle);
                    $parts[] = $edittranscript;
            }else{
                $parts[] = $itemtitle;
            }



            $editcell = new \html_table_cell(implode('<br />', $parts));

		    //attempt delete
			$deleteurl = new \moodle_url($actionurl, array('id'=>$cm->id,'attemptid'=>$attempt->id,'action'=>'confirmdelete'));
			$deletelink = \html_writer::link($deleteurl, get_string('deleteattempt', constants::M_COMPONENT));
			$deletecell = new \html_table_cell($deletelink);

			$row->cells = array(
                    $attemptdatecell, $editcell, $deletecell
			);
			$table->data[] = $row;
		}

		return \html_writer::table($table);

	}

    function setup_datatables($tableid){
        global $USER;

        $tableprops = array();
        $columns = array();
        //for cols .. .'attemptname', 'attempttype','timemodified', 'edit','delete'
        $columns[0]=null;
        $columns[1]=null;
        $columns[2]=null;
        $columns[3]=null;
        $columns[4]=null;
        $tableprops['columns']=$columns;

        //default ordering
        $order = array();
        //$order[0] =array(3, "desc");
       //$tableprops['order']=$order;

        //here we set up any info we need to pass into javascript
        $opts =Array();
        $opts['tableid']=$tableid;
        $opts['tableprops']=$tableprops;
        $this->page->requires->js_call_amd("mod_solo/datatables", 'init', array($opts));
        $this->page->requires->css( new \moodle_url('https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css'));
    }

    function fetch_recorder_amd($cm){
        global $USER;

        $widgetid = constants::M_WIDGETID;
        //any html we want to return to be sent to the page
        $ret_html = '';

        //here we set up any info we need to pass into javascript
        $recopts =Array();
        $recopts['recorderid']=$widgetid . '_recorderdiv';


        //this inits the M.mod_solo thingy, after the page has loaded.
        //we put the opts in html on the page because moodle/AMD doesn't like lots of opts in js
        $jsonstring = json_encode($recopts);
        $opts_html = \html_writer::tag('input', '', array('id' => 'amdopts_' . $widgetid, 'type' => 'hidden', 'value' => $jsonstring));

        //the recorder div
        $ret_html = $ret_html . $opts_html;

        $opts=array('cmid'=>$cm->id,'widgetid'=>$widgetid);
        $this->page->requires->js_call_amd("mod_solo/recordercontroller", 'init', array($opts));

        //these need to be returned and echo'ed to the page
        return $ret_html;
    }

}