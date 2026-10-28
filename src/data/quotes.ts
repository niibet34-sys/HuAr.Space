export type ArchiveQuote = {
  id: string
  text: string
  author: string
  meta: string
  source: string
  kind: 'historical'
}

export const historicalQuotes: ArchiveQuote[] = [
  { id: 'h001', text: 'The unexamined life is not worth living.', author: 'Socrates', meta: 'Socrates · Plato, Apology', source: 'Plato, Apology', kind: 'historical' },
  { id: 'h002', text: 'Man is by nature a political animal.', author: 'Aristotle', meta: 'Aristotle · Politics', source: 'Politics', kind: 'historical' },
  { id: 'h003', text: 'Life is short, and art long.', author: 'Hippocrates', meta: 'Hippocrates · Aphorisms', source: 'Aphorisms', kind: 'historical' },
  { id: 'h004', text: 'The life of the dead is placed in the memory of the living.', author: 'Cicero', meta: 'Cicero · Philippics', source: 'Philippics', kind: 'historical' },
  { id: 'h005', text: 'It is not that we have a short time to live, but that we waste much of it.', author: 'Seneca', meta: 'Seneca · On the Shortness of Life', source: 'On the Shortness of Life', kind: 'historical' },
  { id: 'h006', text: 'The universe is change; our life is what our thoughts make it.', author: 'Marcus Aurelius', meta: 'Marcus Aurelius · Meditations', source: 'Meditations', kind: 'historical' },
  { id: 'h007', text: 'To see what is right and not to do it is want of courage.', author: 'Confucius', meta: 'Confucius · Analects', source: 'Analects', kind: 'historical' },
  { id: 'h008', text: 'Knowledge itself is power.', author: 'Francis Bacon', meta: 'Francis Bacon · Meditationes Sacrae', source: 'Meditationes Sacrae', kind: 'historical' },
  { id: 'h009', text: 'To thine own self be true.', author: 'William Shakespeare', meta: 'Shakespeare · Hamlet', source: 'Hamlet', kind: 'historical' },
  { id: 'h010', text: 'We are such stuff as dreams are made on.', author: 'William Shakespeare', meta: 'Shakespeare · The Tempest', source: 'The Tempest', kind: 'historical' },
  { id: 'h011', text: 'No man is an island, entire of itself.', author: 'John Donne', meta: 'John Donne · Devotions', source: 'Devotions upon Emergent Occasions', kind: 'historical' },
  { id: 'h012', text: 'I think, therefore I am.', author: 'René Descartes', meta: 'Descartes · Discourse on the Method', source: 'Discourse on the Method', kind: 'historical' },
  { id: 'h013', text: 'The heart has its reasons, which reason does not know.', author: 'Blaise Pascal', meta: 'Pascal · Pensées', source: 'Pensées', kind: 'historical' },
  { id: 'h014', text: 'If I have seen further it is by standing on the shoulders of Giants.', author: 'Isaac Newton', meta: 'Isaac Newton · Letter to Robert Hooke', source: 'Letter to Robert Hooke', kind: 'historical' },
  { id: 'h015', text: 'To err is human; to forgive, divine.', author: 'Alexander Pope', meta: 'Alexander Pope · An Essay on Criticism', source: 'An Essay on Criticism', kind: 'historical' },
  { id: 'h016', text: 'Man is born free, and everywhere he is in chains.', author: 'Jean-Jacques Rousseau', meta: 'Rousseau · The Social Contract', source: 'The Social Contract', kind: 'historical' },
  { id: 'h017', text: 'Have courage to use your own understanding!', author: 'Immanuel Kant', meta: 'Immanuel Kant · What Is Enlightenment?', source: 'What Is Enlightenment?', kind: 'historical' },
  { id: 'h018', text: 'I do not wish them to have power over men; but over themselves.', author: 'Mary Wollstonecraft', meta: 'Mary Wollstonecraft · A Vindication', source: 'A Vindication of the Rights of Woman', kind: 'historical' },
  { id: 'h019', text: 'There is no charm equal to tenderness of heart.', author: 'Jane Austen', meta: 'Jane Austen · Emma', source: 'Emma', kind: 'historical' },
  { id: 'h020', text: 'Nothing great was ever achieved without enthusiasm.', author: 'Ralph Waldo Emerson', meta: 'Ralph Waldo Emerson · Essays', source: 'Essays', kind: 'historical' },
  { id: 'h021', text: 'The mass of men lead lives of quiet desperation.', author: 'Henry David Thoreau', meta: 'Henry David Thoreau · Walden', source: 'Walden', kind: 'historical' },
  { id: 'h022', text: 'Rather than love, than money, than fame, give me truth.', author: 'Henry David Thoreau', meta: 'Henry David Thoreau · Walden', source: 'Walden', kind: 'historical' },
  { id: 'h023', text: 'I am large, I contain multitudes.', author: 'Walt Whitman', meta: 'Walt Whitman · Song of Myself', source: 'Song of Myself', kind: 'historical' },
  { id: 'h024', text: 'Lost time is never found again.', author: 'Benjamin Franklin', meta: 'Benjamin Franklin · Poor Richard’s Almanack', source: 'Poor Richard’s Almanack', kind: 'historical' },
  { id: 'h025', text: 'Power concedes nothing without a demand. It never did and it never will.', author: 'Frederick Douglass', meta: 'Frederick Douglass · 1857', source: 'West India Emancipation speech', kind: 'historical' },
  { id: 'h026', text: 'Government of the people, by the people, for the people, shall not perish from the earth.', author: 'Abraham Lincoln', meta: 'Abraham Lincoln · Gettysburg Address', source: 'Gettysburg Address', kind: 'historical' },
  { id: 'h027', text: 'All happy families are alike; each unhappy family is unhappy in its own way.', author: 'Leo Tolstoy', meta: 'Leo Tolstoy · Anna Karenina', source: 'Anna Karenina', kind: 'historical' },
  { id: 'h028', text: 'We are all in the gutter, but some of us are looking at the stars.', author: 'Oscar Wilde', meta: 'Oscar Wilde · Lady Windermere’s Fan', source: 'Lady Windermere’s Fan', kind: 'historical' },
  { id: 'h029', text: 'Without music, life would be a mistake.', author: 'Friedrich Nietzsche', meta: 'Friedrich Nietzsche · Twilight of the Idols', source: 'Twilight of the Idols', kind: 'historical' },
  { id: 'h030', text: 'Life can only be understood backwards; but it must be lived forwards.', author: 'Søren Kierkegaard', meta: 'Søren Kierkegaard · Journals', source: 'Journals', kind: 'historical' },
  { id: 'h031', text: 'Forever is composed of nows.', author: 'Emily Dickinson', meta: 'Emily Dickinson · Letter, 1862', source: 'Letter, 1862', kind: 'historical' },
  { id: 'h032', text: 'A woman must have money and a room of her own if she is to write fiction.', author: 'Virginia Woolf', meta: 'Virginia Woolf · A Room of One’s Own', source: 'A Room of One’s Own', kind: 'historical' },
  { id: 'h033', text: 'From so simple a beginning endless forms most beautiful and most wonderful have been, and are being, evolved.', author: 'Charles Darwin', meta: 'Charles Darwin · On the Origin of Species', source: 'On the Origin of Species', kind: 'historical' },
  { id: 'h034', text: 'The mind is its own place, and in itself can make a heaven of hell, a hell of heaven.', author: 'John Milton', meta: 'John Milton · Paradise Lost', source: 'Paradise Lost', kind: 'historical' },
  { id: 'h035', text: 'The world is my country, all mankind are my brethren, and to do good is my religion.', author: 'Thomas Paine', meta: 'Thomas Paine · Letter to Henry Truslow', source: 'Letter to Henry Truslow', kind: 'historical' },
]

export const archiveQuotes = historicalQuotes
