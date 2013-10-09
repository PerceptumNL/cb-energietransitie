import sys

sys.path.insert(0,'.')
import argparse
import etl
if __name__ =='__main__':
    PARSER = argparse.ArgumentParser(add_help=False, parents=[etl.PARSER])
    etl.main(PARSER.parse_args())
