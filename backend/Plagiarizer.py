import re
import random

text_to_plagiarize = open("TargetCS.txt", "r").read().lower()
text_to_plagiarize = re.sub(r"\?\s", " <EOS> ", text_to_plagiarize)
text_to_plagiarize = re.sub(r"\!\s", " <EOS> ", text_to_plagiarize)
tokens_to_plagiarize = re.sub(r"\.\s", " <EOS> ", text_to_plagiarize).split()
required_choices = 3

def does_match(previous_words, num_to_match, i):
    j = 1
    while j <= num_to_match:
        if (previous_words[-j] == tokens_to_plagiarize[i - j]):
            j += 1
        else:
            return False
    return True

def get_next_word(previous_words, num_to_match):
    if num_to_match > len(previous_words):
        return get_next_word(previous_words, len(previous_words))
    else:
        i = 0
        matches = []
        while i < len(tokens_to_plagiarize):
            if does_match(previous_words, num_to_match, i):
                matches = matches + [tokens_to_plagiarize[i]]
                #print(matches[-1])
            i += 1
        if len(matches) < required_choices:
            return get_next_word(previous_words, num_to_match - 1)
        else:
            return matches[random.randint(0, len(matches) - 1)]

def make_sentence_tokens():
    previous_words = []
    next_word = ""
    num_to_match = 5
    while next_word != "<EOS>":
        next_word = get_next_word(previous_words, num_to_match)
        previous_words = previous_words + [next_word]
    return previous_words

def write_sentence_tokens(sentence_tokens):
    line = ""
    if len(sentence_tokens) == 1:
        line = sentence_tokens[0]
    else:
        line += sentence_tokens[0].title() + " "
        i = 1
        while i < len(sentence_tokens) - 2:
            line += sentence_tokens[i] + " "
            i += 1
        line += sentence_tokens[i] + ".\n"
    return line

print(" ")
print("\033[96m" + write_sentence_tokens(make_sentence_tokens()) + "\033[00m")
print(" ")
