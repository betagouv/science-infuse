export interface InteractiveVideoAnswer {
    answer: string;
    correct: boolean;
}

export interface InteractiveVideoQuestion {
    question: string;
    answers: InteractiveVideoAnswer[];
}

export interface InteractiveVideoDefinition {
    notion: string;
    definition: string;
}

export interface InteractiveVideoQuestionGroup {
    timestamp: number;
    questions: InteractiveVideoQuestion[];
}

export interface InteractiveVideoDefinitionGroup {
    timestamp: number;
    definitions: InteractiveVideoDefinition[];
}

export interface InteractiveVideoData {
    videoPublicUrl: string;
    videoTitle: string;
    questions: InteractiveVideoQuestionGroup[];
    definitions: InteractiveVideoDefinitionGroup[];
}

const parseVideoContent = (input: string): {
    questions: InteractiveVideoQuestionGroup[],
    definitions: InteractiveVideoDefinitionGroup[]
} => {
    const lines = input.split('\n').filter(line => line.trim());
    const questionMap = new Map<number, InteractiveVideoQuestion[]>();
    const definitionMap = new Map<number, InteractiveVideoDefinition[]>();

    let currentQuestion: InteractiveVideoQuestion | null = null;

    lines.forEach(line => {
        const definitionMatch = line.match(/^timestamp \[(\d+); (\d+)\] => \| (.+?) \| (.+)$/);
        if (definitionMatch) {
            const [, , timestamp, notion, definition] = definitionMatch;
            const endTimestamp = parseInt(timestamp, 10);

            if (!definitionMap.has(endTimestamp)) {
                definitionMap.set(endTimestamp, []);
            }

            definitionMap.get(endTimestamp)?.push({
                notion: notion.trim(),
                definition: definition.trim()
            });
            return;
        }

        const timestampMatch = line.match(/^(?:\d+\) )?timestamp \[(\d+); (\d+)\] => (.+)$/);
        const answerMatch = line.match(/^([A-D])\) ([*|X]) (.+)$/);

        if (timestampMatch) {
            const [, , timestamp, questionText] = timestampMatch;
            const endTimestamp = parseInt(timestamp, 10);

            if (!questionMap.has(endTimestamp)) {
                questionMap.set(endTimestamp, []);
            }

            currentQuestion = {
                question: questionText.trim(),
                answers: []
            };

            questionMap.get(endTimestamp)?.push(currentQuestion);
        } else if (answerMatch && currentQuestion) {
            const [, , correctness, text] = answerMatch;
            currentQuestion.answers.push({
                answer: text.trim(),
                correct: correctness === '*'
            });
        }
    });

    // Filter questions without answers
    questionMap.forEach((questions, timestamp) => {
        questionMap.set(timestamp, questions.filter(q => q.answers.length > 0));
    });

    const questions = mergeCloseQuestions(
        Array.from(questionMap.entries())
            .filter(([, questions]) => questions.some(q => q.answers.length > 0))
            .map(([timestamp, questions]) => ({
                timestamp,
                questions: questions.filter(q => q.answers.length > 0)
            })),
        30
    );

    const definitions = mergeCloseDefinitions(
        Array.from(definitionMap.entries())
            .map(([timestamp, definitions]) => ({
                timestamp,
                definitions
            })),
        30
    );

    return { questions, definitions };
};

const mergeCloseQuestions = (
    groups: InteractiveVideoQuestionGroup[],
    timeThreshold: number
): InteractiveVideoQuestionGroup[] => {
    if (groups.length === 0) return [];

    const sortedGroups = [...groups].sort((a, b) => a.timestamp - b.timestamp);
    const mergedGroups: InteractiveVideoQuestionGroup[] = [sortedGroups[0]];

    for (let i = 1; i < sortedGroups.length; i++) {
        const current = sortedGroups[i];
        const previous = mergedGroups[mergedGroups.length - 1];

        if (current.timestamp - previous.timestamp <= timeThreshold) {
            previous.questions.push(...current.questions);
            previous.timestamp = current.timestamp;
        } else {
            mergedGroups.push(current);
        }
    }

    return mergedGroups;
};

const mergeCloseDefinitions = (
    groups: InteractiveVideoDefinitionGroup[],
    timeThreshold: number
): InteractiveVideoDefinitionGroup[] => {
    if (groups.length === 0) return [];

    const sortedGroups = [...groups].sort((a, b) => a.timestamp - b.timestamp);
    const mergedGroups: InteractiveVideoDefinitionGroup[] = [sortedGroups[0]];

    for (let i = 1; i < sortedGroups.length; i++) {
        const current = sortedGroups[i];
        const previous = mergedGroups[mergedGroups.length - 1];

        if (current.timestamp - previous.timestamp <= timeThreshold) {
            previous.definitions.push(...current.definitions);
            previous.timestamp = current.timestamp;
        } else {
            mergedGroups.push(current);
        }
    }

    return mergedGroups;
};


const main = async () => {
    const response = `
Voici les questions et les définitions basées sur la transcription de la vidéo :

questions:
timestamp [6; 20] => Quelles sont les conditions extrêmes que le tardigrade peut endurer ?
A) * Pressure four fois supérieures à celles des abysses, radiations nucléaires, vide sidérales et températures glaciales 
B) X Températures élevées, pressions faibles et radiations solaires
C) X Pressions élevées, températures élevées et humidité élevée
D) X Températures glaciales, pressions faibles et radiations faibles

timestamp [31; 70] => Qu'est-ce que le tardigrade peut faire pour survivre à des conditions de sécheresse ?
A) * Mettre à l'arrêt son métabolisme en se débarrassant de 95% de l'eau qui le compose
B) X Augmenter son métabolisme pour compenser la perte d'eau
C) X Chercher de l'eau pour se réhydrater
D) X Se camoufler pour éviter la déshydratation

timestamp [71; 113] => Qu'est-ce que les chercheurs ont découvert sur les tardigrades qui leur permet de survivre à des conditions de stress extrêmes ?
A) * Les tardigrades produisent des molécules instables nocifs pour les cellules humaines, des radicaux libres oxygénés, qui déclenchent un signal de survie
B) X Les tardigrades produisent des molécules stables bénéfiques pour les cellules humaines
C) X Les tardigrades n'ont pas de mécanisme de défense contre le stress
D) X Les tardigrades ne produisent pas de radicaux libres oxygénés

timestamp [122; 138] => Qu'est-ce que les résultats de l'étude sur les tardigrades pourraient apporter à l'humanité ?
A) * Des pistes de recherche utiles pour comprendre le vieillissement et potentiellement le ralentir
B) X Des traitements pour guérir les maladies infectieuses
C) X Des méthodes pour augmenter la production de radicaux libres oxygénés
D) X Des moyens de communicator avec les tardigrades

definitions:
timestamp [31; 70] => | cryptobiose | état de dormance dans lequel le tardigrade peut se mettre pour survivre à des conditions de sécheresse
timestamp [71; 113] => | radicaux libres oxygénés | molécules instables nocives pour les cellules humaines, produites par les tardigrades en réaction au stress
timestamp [122; 138] => | cystéine | acide aminé important, oxydé par les radicaux libres oxygénés, qui déclenche un signal de survie chez les tardigrades`;
    const {questions, definitions} = parseVideoContent(response);
    questions.forEach(x => console.log((x)))
    definitions.forEach(x => console.log(x))

}

main()


